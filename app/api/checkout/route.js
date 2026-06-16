import { products } from "../../../lib/catalog/data";
import { sampleAlbumTemplate, renderLightBurnSvg } from "../../../lib/lightburn/render.mjs";
import { calculateProductTotal, priceModifiers } from "../../../lib/pricing";
import { prisma } from "../../../lib/server/prisma";
import { stripe } from "../../../lib/server/stripe";

const templates = {
  "sample-album": sampleAlbumTemplate,
};

export async function POST(request) {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "database_not_configured" },
      { status: 503 },
    );
  }

  const body = await request.json();
  const headerValues = {
    "x-forwarded-for": request.headers.get("x-forwarded-for"),
    "user-agent": request.headers.get("user-agent"),
  };
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const locale = body.locale === "pl" ? "pl" : "no";
  const cartItems = Array.isArray(body.items) ? body.items : [];
  const consents = body.consents ?? {};

  if (!email || cartItems.length === 0) {
    return Response.json(
      { error: "invalid_checkout_payload" },
      { status: 400 },
    );
  }

  if (!consents.terms || !consents.privacy || !consents.personalizedNoReturn) {
    return Response.json(
      { error: "required_consents_missing" },
      { status: 400 },
    );
  }

  const normalizedItems = cartItems.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);

    if (!product) {
      throw new Error("unknown_product");
    }

    const template = templates[product.templateId];
    const options = {
      names: String(item.options?.names ?? "").trim(),
      occasionDate: String(item.options?.occasionDate ?? "").trim(),
      dedication: String(item.options?.dedication ?? "").trim(),
      dimensions: String(item.options?.dimensions ?? "").trim(),
      express: Boolean(item.options?.express),
      giftWrap: Boolean(item.options?.giftWrap),
    };

    if (!options.names || !options.dedication) {
      throw new Error("missing_required_personalization");
    }

    if (product.requiresDimensions && !options.dimensions) {
      throw new Error("missing_required_dimensions");
    }

    const renderResult = renderLightBurnSvg({
      template,
      values: {
        names: options.names,
        dedication: options.dedication,
      },
    });

    return {
      product,
      options,
      renderResult,
      total: calculateProductTotal(product, options),
    };
  });

  const subtotalGrossNok = normalizedItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const mvaNok = Math.round(subtotalGrossNok * 0.2);
  const orderNo = createOrderNumber();
  const status = normalizedItems.some((item) => item.renderResult.metadata.requiresReview)
    ? "needs_review"
    : "awaiting_payment";

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email },
      update: {
        phone: phone || null,
      },
      create: {
        email,
        phone: phone || null,
      },
    });

    const createdOrder = await tx.order.create({
      data: {
        orderNo,
        customerId: customer.id,
        email,
        phone: phone || null,
        locale,
        status,
        currency: "NOK",
        subtotalGrossNok,
        mvaNok,
        totalGrossNok: subtotalGrossNok,
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.product.id,
            productSnapshot: {
              id: item.product.id,
              category: item.product.category,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price,
            },
            personalizationSnapshot: item.options,
            priceSnapshot: {
              basePriceNokGross: item.product.price,
              expressNok: item.options.express ? priceModifiers.express : 0,
              giftWrapNok: item.options.giftWrap ? priceModifiers.giftWrap : 0,
              totalGrossNok: item.total,
            },
            templateVersion: item.renderResult.metadata.templateVersion,
            fontVersion: "bundled-3.1.5",
            svgHash: item.renderResult.metadata.hash,
            requiresReview: item.renderResult.metadata.requiresReview,
            reviewReason: item.renderResult.metadata.warnings[0]?.reason ?? null,
          })),
        },
        payments: {
          create: {
            provider: "manual-placeholder",
            status: "pending",
            amountGrossNok: subtotalGrossNok,
          },
        },
      },
      include: {
        items: true,
      },
    });

    await tx.consentRecord.createMany({
      data: [
        createConsent(customer.id, createdOrder.id, "terms", headerValues, true),
        createConsent(customer.id, createdOrder.id, "privacy", headerValues, true),
        createConsent(
          customer.id,
          createdOrder.id,
          "personalized_no_standard_return",
          headerValues,
          true,
        ),
        createConsent(
          customer.id,
          createdOrder.id,
          "marketing",
          headerValues,
          Boolean(consents.marketing),
        ),
      ],
    });

    return createdOrder;
  });

  let stripeUrl = null;

  if (stripe && process.env.NEXT_PUBLIC_SITE_URL) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.orderNo,
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?orderNo=${order.orderNo}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel?orderNo=${order.orderNo}`,
      locale: locale === "pl" ? "pl" : "auto",
      metadata: {
        orderId: order.id,
        orderNo: order.orderNo,
      },
      line_items: normalizedItems.map((item) => ({
        quantity: 1,
        price_data: {
          currency: "nok",
          unit_amount: item.total * 100,
          product_data: {
            name: item.product.name[locale] ?? item.product.name.pl,
            description: item.options.dedication,
          },
        },
      })),
    });

    stripeUrl = session.url;

    await prisma.payment.updateMany({
      where: {
        orderId: order.id,
        provider: "manual-placeholder",
      },
      data: {
        provider: "stripe_checkout",
        providerSessionId: session.id,
      },
    });
  }

  return Response.json({
    orderNo: order.orderNo,
    status: order.status,
    itemCount: order.items.length,
    stripeUrl,
  });
}

function createOrderNumber() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `LD-${year}${month}${day}-${random}`;
}

function createConsent(customerId, orderId, type, headers, accepted) {
  return {
    customerId,
    orderId,
    type,
    accepted,
    documentVersion: "2026-06-16",
    textSnapshot: consentText[type],
    source: "checkout",
    ipAddress: requestHeader(headers, "x-forwarded-for"),
    userAgent: requestHeader(headers, "user-agent"),
  };
}

function requestHeader(headers, name) {
  if (!headers || typeof headers !== "object") {
    return null;
  }

  return headers[name] ?? null;
}

const consentText = {
  terms: "Akceptuję regulamin.",
  privacy: "Zapoznałem/am się z polityką prywatności.",
  personalized_no_standard_return:
    "Rozumiem, że produkt personalizowany może nie podlegać standardowemu zwrotowi po rozpoczęciu realizacji.",
  marketing: "Chcę otrzymywać informacje marketingowe.",
};
