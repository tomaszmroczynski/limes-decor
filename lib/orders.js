export const statusLabels = {
  new: "Nowe",
  awaiting_payment: "Oczekuje na platnosc",
  paid: "Oplacone",
  needs_review: "Do weryfikacji",
  in_production: "W produkcji",
  ready_to_ship: "Gotowe do wysylki",
  shipped: "Wyslane",
  completed: "Zakonczone",
  cancelled: "Anulowane",
  complaint: "Reklamacja",
};

export function formatPrice(value) {
  return `${value.toLocaleString("nb-NO")} NOK`;
}

export function localizeValue(value, locale) {
  if (typeof value === "string") {
    return value;
  }

  return value?.[locale] ?? value?.pl ?? "";
}
