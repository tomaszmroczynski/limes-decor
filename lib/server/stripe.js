import Stripe from "stripe";

const globalForStripe = globalThis;

export const stripe =
  globalForStripe.stripe ??
  (process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null);

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}
