import { prisma } from "../../../../lib/server/prisma";
import { stripe } from "../../../../lib/server/stripe";

export async function POST(request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json(
      { error: "stripe_webhook_not_configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "missing_stripe_signature" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return Response.json(
      { error: "invalid_stripe_signature", message: error.message },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object);
  }

  if (event.type === "checkout.session.expired") {
    await handleCheckoutExpired(event.data.object);
  }

  return Response.json({ received: true });
}

async function handleCheckoutCompleted(session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) {
    return;
  }

  const nextStatus = order.items.some((item) => item.requiresReview)
    ? "needs_review"
    : "paid";

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: {
        orderId,
      },
      data: {
        provider: "stripe_checkout",
        status: "succeeded",
        providerSessionId: session.id,
        providerPaymentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        rawEvent: session,
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
      },
    }),
  ]);
}

async function handleCheckoutExpired(session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return;
  }

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: {
        orderId,
      },
      data: {
        provider: "stripe_checkout",
        status: "expired",
        providerSessionId: session.id,
        rawEvent: session,
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: "awaiting_payment",
      },
    }),
  ]);
}
