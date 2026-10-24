import Stripe from "npm:stripe@14.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
// A local copy of the shop's pricing module (npm run functions:sync), so bulk discounts and postage
// always match the site. Prices per metre come from the products table, never from the browser.
import { COUNTRIES, MAX_CART_METRES, MIN_METRES, SHIPPING, STEP, TIERS, metresLabel, priceLine, shippingCost } from "./pricing.js";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

// The service role reads the catalogue whatever its Row Level Security says.
const supabase = createClient(Deno.env.get("SUPABASE_URL") as string, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string, {
  auth: { persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://esterica.boanetworks.com";

class BadRequest extends Error {}

type ProductRow = { slug: string; name: string; price: number; category: string; stock: number | string; image_url: string | null };

// Unsplash photographs are sized through the URL, as on the site; uploaded ones are sent as they are.
const stripeImage = (url: string | null) =>
  !url ? [] : [url.startsWith("https://images.unsplash.com/") ? `${url}?auto=format&fit=crop&w=800&q=70` : url];

// Accepts only { slug, metres } per cloth. Anything else the browser sends, such as a price, is ignored.
async function priceCart(items: unknown) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) throw new BadRequest("Your cart is empty.");

  // Merge repeats of one cloth so the per-cloth metre limit cannot be dodged.
  const metresBySlug = new Map<string, number>();
  for (const item of items) {
    const slug = typeof item?.slug === "string" ? item.slug : "";
    const metres = Number(item?.metres);
    if (!slug) throw new BadRequest("A fabric in your cart is no longer available.");
    if (!Number.isFinite(metres)) throw new BadRequest("Invalid length.");
    metresBySlug.set(slug, (metresBySlug.get(slug) ?? 0) + metres);
  }

  const { data, error } = await supabase
    .from("products")
    .select("slug, name, price, category, stock, image_url")
    .in("slug", [...metresBySlug.keys()]);
  if (error) throw error;
  const bySlug = new Map((data as ProductRow[]).map((p) => [p.slug, p]));

  return [...metresBySlug].map(([slug, metres]) => {
    const product = bySlug.get(slug);
    if (!product) throw new BadRequest("A fabric in your cart is no longer available.");
    if (metres < MIN_METRES || metres > MAX_CART_METRES || Math.round(metres / STEP) * STEP !== metres) {
      throw new BadRequest("Invalid length.");
    }
    const stock = Number(product.stock);
    if (stock < MIN_METRES) throw new BadRequest(`${product.name} has sold out. Please remove it from your cart.`);
    if (metres > stock) throw new BadRequest(`Only ${metresLabel(stock)} of ${product.name} is left. Please lower the length in your cart.`);
    const tierLabel = TIERS[product.category as keyof typeof TIERS]?.label ?? product.category;
    return { product, tierLabel, metres, ...priceLine(product.price, metres) };
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, method, country } = await req.json();

    if (!(method in SHIPPING)) throw new BadRequest("Choose a delivery option.");
    if (!(country in COUNTRIES)) throw new BadRequest("Choose a country.");

    // The owner can close the shop from the admin portal; with no settings row it stays open.
    const settings = await supabase.from("store_settings").select("is_open").eq("id", 1).maybeSingle();
    if (settings.error) throw settings.error;
    if (settings.data?.is_open === false) throw new BadRequest("We are not taking card payments online at the moment. Please order on WhatsApp.");

    const lines = await priceCart(items);
    const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
    const shipping = shippingCost(method, subtotal, country);
    if (shipping === null) throw new BadRequest("Postage outside the UK is quoted, so please order on WhatsApp.");

    // One Stripe line per cloth: lengths come in half metres and carry bulk discounts, so the whole line is the unit.
    const line_items = lines.map((l) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${l.product.name}, ${metresLabel(l.metres)}`,
          description: l.rate ? `${l.tierLabel}, includes ${Math.round(l.rate * 100)}% bulk discount` : l.tierLabel,
          images: stripeImage(l.product.image_url),
        },
        unit_amount: l.total,
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      shipping_options: [{
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: SHIPPING[method as keyof typeof SHIPPING].label,
          fixed_amount: { amount: shipping, currency: "gbp" },
        },
      }],
      ...(method === "standard" && { shipping_address_collection: { allowed_countries: ["GB"] } }),
      phone_number_collection: { enabled: true },
      metadata: { method, country, order: lines.map((l) => `${l.product.slug}:${l.metres}`).join(",") },
      success_url: `${SITE}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}/cart`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Only our own validation messages reach the customer; Stripe and runtime errors stay in the logs.
    if (!(error instanceof BadRequest)) console.error(error);
    const message = error instanceof BadRequest ? error.message : "Could not start checkout.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof BadRequest ? 400 : 500,
    });
  }
});
