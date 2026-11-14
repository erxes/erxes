export const POS_ORDER_CONTENT_TYPE = 'sales:pos.orders';

export const POS_COVER_CONTENT_TYPE = 'sales:pos.covers';

const POS_PAGE = /^\/sales\/pos\/([^/]+)\//;
const POS_STATIC_SEGMENTS = new Set(['orders', 'covers', 'loyalty']);

const getPosIdFromPath = (pathname: string) => {
  const posId = POS_PAGE.exec(pathname)?.[1];

  return posId && !POS_STATIC_SEGMENTS.has(posId) ? posId : undefined;
};

export const getPosOrderDetailPath = (orderId: string, pathname: string) => {
  const posId = getPosIdFromPath(pathname);

  return posId
    ? `/sales/pos/${posId}/orders/${orderId}`
    : `/sales/pos/orders/${orderId}`;
};

export const getPosCoverDetailPath = (coverId: string, pathname: string) => {
  const posId = getPosIdFromPath(pathname);

  return posId
    ? `/sales/pos/${posId}/covers/${coverId}`
    : `/sales/pos/covers/${coverId}`;
};
