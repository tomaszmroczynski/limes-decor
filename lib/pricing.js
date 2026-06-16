export const priceModifiers = {
  express: 300,
  giftWrap: 90,
};

export function calculateProductTotal(product, options = {}) {
  return (
    product.price +
    (options.express ? priceModifiers.express : 0) +
    (options.giftWrap ? priceModifiers.giftWrap : 0)
  );
}

export function calculateCartTotal(items) {
  return items.reduce(
    (total, item) => total + calculateProductTotal(item.product, item.options),
    0,
  );
}

export function formatPrice(value) {
  return `${value.toLocaleString("nb-NO")} NOK`;
}
