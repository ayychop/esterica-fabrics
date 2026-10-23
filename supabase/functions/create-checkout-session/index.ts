import Stripe from "npm:stripe@14.0.0";
// The shop's own product and pricing modules, so the charge always matches the site and never the browser.
import { productBySlug } from "../../../src/data/products.js";
import { COUNTRIES, MAX_CART_METRES, MIN_METRES, SHIPPING, STEP, metresLabel, priceLine, shippingCost } from "../../../src/lib/pricing.js";
import { img } from "../../../src/config.js";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://esterica.boanetworks.com";

class BadRequest extends Error {}

// Accepts only { slug, metres } per cloth. Anything else the browser sends, such as a price, is ignored.
function priceCart(items: unknown) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) throw new BadRequest("Your cart is empty.");

  // Merge repeats of one cloth so the per-cloth metre limit cannot be dodged.
  const metresBySlug = new Map<string, number>();
  for (const item of items) {
    const slug = typeof item?.slug === "string" ? item.slug : "";
    const metres = Number(item?.metres);
    if (!productBySlug(slug)) throw new BadRequest("A fabric in your cart is no longer available.");
    if (!Number.isFinite(metres)) throw new BadRequest("Invalid length.");
    metresBySlug.set(slug, (metresBySlug.get(slug) ?? 0) + metres);
  }

  return [...metresBySlug].map(([slug, metres]) => {
    if (metres < MIN_METRES || metres > MAX_CART_METRES || Math.round(metres / STEP) * STEP !== metres) {
      throw new BadRequest("Invalid length.");
    }
    const product = productBySlug(slug)!;
    return { product, metres, ...priceLine(product.perMetre, metres) };
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

    const lines = priceCart(items);
    const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
    const shipping = shippingCost(method, subtotal, country);
    if (shipping === null) throw new BadRequest("Postage outside the UK is quoted, so please order on WhatsApp.");

    // One Stripe line per cloth: lengths come in half metres and carry bulk discounts, so the whole line is the unit.
    const line_items = lines.map((l) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${l.product.name}, ${metresLabel(l.metres)}`,
          description: l.rate ? `${l.product.tierLabel}, includes ${Math.round(l.rate * 100)}% bulk discount` : l.product.tierLabel,
          images: [img(l.product.imageId, 800)],
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
