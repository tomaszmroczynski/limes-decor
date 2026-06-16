import { prisma } from "../../../lib/server/prisma";
import { formatPrice, localizeValue, statusLabels } from "../../../lib/orders";

export default async function OrderPage({ params }) {
  const { orderNo } = await params;

  if (!process.env.DATABASE_URL) {
    return (
      <main className="checkout-result">
        <div className="checkout-result-card">
          <span className="eyebrow">LIMES DEKOR</span>
          <h1>Baza danych nie jest skonfigurowana</h1>
          <p>Nie moge jeszcze pokazac statusu zamowienia bez polaczenia z baza.</p>
          <a className="primary-button" href="/">
            Wroc do strony glownej
          </a>
        </div>
      </main>
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    return (
      <main className="checkout-result">
        <div className="checkout-result-card">
          <span className="eyebrow">LIMES DEKOR</span>
          <h1>Nie znaleziono zamowienia</h1>
          <p>Sprawdz numer zamowienia i sprobuj ponownie.</p>
          <strong>Numer zamowienia: {orderNo}</strong>
          <a className="primary-button" href="/">
            Wroc do strony glownej
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="order-page">
      <section className="order-page-card">
        <div className="order-page-header">
          <div>
            <span className="eyebrow">LIMES DEKOR</span>
            <h1>Status zamowienia</h1>
          </div>
          <div className="order-badge">{statusLabels[order.status] ?? order.status}</div>
        </div>

        <div className="order-summary-grid">
          <article>
            <small>Numer zamowienia</small>
            <strong>{order.orderNo}</strong>
          </article>
          <article>
            <small>E-mail</small>
            <strong>{order.email}</strong>
          </article>
          <article>
            <small>Telefon</small>
            <strong>{order.phone || "Brak"}</strong>
          </article>
          <article>
            <small>Kwota</small>
            <strong>{formatPrice(order.totalGrossNok)}</strong>
          </article>
        </div>

        <div className="order-section">
          <h2>Pozycje</h2>
          <div className="order-items-list">
            {order.items.map((item) => {
              const product = item.productSnapshot;
              const personalization = item.personalizationSnapshot;

              return (
                <article className="order-item-card" key={item.id}>
                  <div className="order-item-top">
                    <div>
                      <h3>{localizeValue(product?.name, order.locale)}</h3>
                      <p>{personalization?.names}</p>
                    </div>
                    <strong>{formatPrice(item.priceSnapshot?.totalGrossNok ?? 0)}</strong>
                  </div>
                  <dl className="order-meta-list">
                    <div>
                      <dt>Dedykacja</dt>
                      <dd>{personalization?.dedication || "Brak"}</dd>
                    </div>
                    <div>
                      <dt>Data / okazja</dt>
                      <dd>{personalization?.occasionDate || "Brak"}</dd>
                    </div>
                    <div>
                      <dt>Wymiary</dt>
                      <dd>{personalization?.dimensions || "Brak"}</dd>
                    </div>
                    <div>
                      <dt>Ekspres</dt>
                      <dd>{personalization?.express ? "Tak" : "Nie"}</dd>
                    </div>
                    <div>
                      <dt>Pakowanie prezentowe</dt>
                      <dd>{personalization?.giftWrap ? "Tak" : "Nie"}</dd>
                    </div>
                    <div>
                      <dt>Weryfikacja</dt>
                      <dd>{item.requiresReview ? item.reviewReason || "Tak" : "Nie"}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </div>

        <div className="order-section">
          <h2>Platnosc</h2>
          <div className="order-payments-list">
            {order.payments.map((payment) => (
              <article className="order-payment-card" key={payment.id}>
                <span>{payment.provider}</span>
                <strong>{payment.status}</strong>
              </article>
            ))}
          </div>
        </div>

        <a className="primary-button" href="/">
          Wroc do strony glownej
        </a>
      </section>
    </main>
  );
}
