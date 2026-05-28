export const REALTIME_EVENT = 'kdream:realtime';

export const PRODUCT_EVENT_TYPES = new Set([
  'product_created',
  'product_updated',
  'product_deleted',
]);

export const TRADE_EVENT_TYPES = new Set([
  'trade_post_created',
  'trade_listing_new',
  'trade_offer',
  'trade_offer_sent',
  'trade_accepted',
  'trade_rejected',
  'trade_superseded',
  'trade_verified',
  'trade_rejected_admin',
]);

export const ORDER_EVENT_TYPES = new Set([
  'order_created',
  'order_update',
  'order_receipt',
]);

export function emitRealtimeMessage(payload) {
  window.dispatchEvent(new CustomEvent(REALTIME_EVENT, { detail: payload }));
}

export function isProductEvent(type) {
  return typeof type === 'string' && PRODUCT_EVENT_TYPES.has(type);
}

export function isTradeEvent(type) {
  return typeof type === 'string' && TRADE_EVENT_TYPES.has(type);
}

export function isOrderEvent(type) {
  return typeof type === 'string' && ORDER_EVENT_TYPES.has(type);
}
