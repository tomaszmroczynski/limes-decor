export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderNo = params?.orderNo ?? "";

  return (
    <main className="checkout-result">
      <div className="checkout-result-card">
        <span className="eyebrow">LIMES DEKOR</span>
        <h1>Platnosc przyjeta</h1>
        <p>
          Dziekuje. Zamowienie zostalo przekazane dalej i czeka na potwierdzenie
          po stronie systemu platnosci.
        </p>
        {orderNo && <strong>Numer zamowienia: {orderNo}</strong>}
        {orderNo && (
          <a className="secondary-link" href={`/order/${orderNo}`}>
            Zobacz status zamowienia
          </a>
        )}
        <a className="primary-button" href="/">
          Wroc do strony glownej
        </a>
      </div>
    </main>
  );
}
