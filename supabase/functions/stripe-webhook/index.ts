import Stripe from "npm:stripe@14.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});
// Deno has no Node crypto, so signatures are checked with Web Crypto.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// The service role key bypasses Row Level Security, so it only ever lives on the server.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string,
  { auth: { persistSession: false } },
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const reply = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  // The signature covers the raw body, so read it as text before anything parses it.
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  if (!signature) return reply({ error: "Missing Stripe signature" }, 400);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") as string,
      undefined,
      cryptoProvider,
    );
  } catch (error) {
    console.error("Webhook signature check failed:", error.message);
    return reply({ error: "Invalid signature" }, 400);
  }

  // Every other event type is acknowledged and ignored, so Stripe stops resending it.
  if (event.type !== "checkout.session.completed") return reply({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return reply({ received: true });

  // create-checkout-session stores what was bought as "slug:metres,slug:metres" in the metadata.
  const items = (session.metadata?.order ?? "")
    .split(",")
    .map((part) => {
      const [slug, metres] = part.split(":");
      return { slug, metres: Number(metres) };
    })
    .filter((i) => i.slug && Number.isFinite(i.metres) && i.metres > 0);
  if (items.length === 0) console.error(`Session ${session.id} has no order metadata, so no stock was taken.`);

  // One database call saves the order and lowers stock together; a repeat delivery changes nothing.
  const { data: recorded, error } = await supabase.rpc("record_paid_order", {
    p_session_id: session.id,
    p_email: session.customer_details?.email ?? null,
    p_amount_total: session.amount_total,
    p_items: items,
  });

  if (error) {
    // A 500 tells Stripe to retry later, so a database hiccup does not lose the order.
    console.error("Could not save order:", error);
    return reply({ error: "Could not save order" }, 500);
  }
  if (!recorded) console.log(`Session ${session.id} was already recorded.`);

  return reply({ received: true });
});
