import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return NextResponse.json({
      error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel."
    }, { status: 400 });
  }

  const body = await request.json();
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });
  const origin = request.headers.get("origin") || "https://praithanprints.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: body.items.map((item: any) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(item.price) * 100),
        product_data: {
          name: item.name,
          description: `${item.selectedSize || "Standard"} • ${item.selectedColor || "Custom"}`
        }
      }
    })),
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    metadata: { source: "praithanprints" }
  });

  return NextResponse.json({ url: session.url });
}
