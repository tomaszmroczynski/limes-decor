import { prisma } from "../../../lib/server/prisma";
import { formatPrice, statusLabels } from "../../../lib/orders";

export default async function AdminOrdersPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="checkout-result">
        <div className="checkout-result-card">
          <span className="eyebrow">LIMES DEKOR ADMIN</span>
          <h1>Baza danych nie jest skonfigurowana</h1>
          <p>Nie moge pokazac listy zamowien bez polaczenia z baza.</p>
          <a className="primary-button" href="/">
            Wroc do strony glownej
          </a>
        </div>
      </main>
    );
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    take: 50,
  });

  return (
    <main className="order-page">
      <section className="order-page-card">
        <div className="order-page-header">
          <div>
            <span className="eyebrow">LIMES DEKOR ADMIN</span>
            <h1>Zamowienia</h1>
          </div>
          <div className="order-badge">{orders.length} pozycji</div>
        </div>

        <div className="admin-orders-list">
          {orders.map((order) => (
            <article className="admin-order-card" key={order.id}>
              <div className="admin-order-top">
                <div>
                  <small>Numer zamowienia</small>
                  <h2>{order.orderNo}</h2>
                </div>
                <div className="order-badge">
                  {statusLabels[order.status] ?? order.status}
                </div>
              </div>

              <div className="admin-order-grid">
                <article>
                  <small>Klient</small>
                  <strong>{order.email}</strong>
                  <p>{order.phone || "Brak telefonu"}</p>
                </article>
                <article>
                  <small>Kwota</small>
                  <strong>{formatPrice(order.totalGrossNok)}</strong>
                  <p>
                    Platnosc: {order.payments[0]?.status ?? "brak statusu"}
                  </p>
                </article>
                <article>
                  <small>Pozycje</small>
                  <strong>{order.items.length}</strong>
                  <p>
                    {order.items
                      .map((item) => item.personalizationSnapshot?.names)
                      .filter(Boolean)
                      .join(", ") || "Brak nazw"}
                  </p>
                </article>
              </div>

              <a className="secondary-link" href={`/order/${order.orderNo}`}>
                Otworz szczegoly zamowienia
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
