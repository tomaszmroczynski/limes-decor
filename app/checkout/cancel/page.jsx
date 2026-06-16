export default async function CheckoutCancelPage({ searchParams }) {
  const params = await searchParams;
  const orderNo = params?.orderNo ?? "";

  return (
    <main className="checkout-result">
      <div className="checkout-result-card">
        <span className="eyebrow">LIMES DEKOR</span>
        <h1>Platnosc anulowana</h1>
        <p>
          Zamowienie zostalo zapisane, ale platnosc nie zostala dokonczona.
          Mozesz wrocic do sklepu i sprobowac ponownie.
        </p>
        {orderNo && <strong>Numer zamowienia: {orderNo}</strong>}
        <a className="primary-button" href="/">
          Wroc do strony glownej
        </a>
      </div>
    </main>
  );
}
