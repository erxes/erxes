import { PANEL_INPUT_CLASS_NAME } from 'ui-modules';

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

export const POS_CREATE_CONTENT_TYPE = 'sales:pos.create';

export const POS_CARD_CONFIG_CONTENT_TYPE = 'sales:pos.cardConfig';

export const POS_CATEGORY_MAPPING_CONTENT_TYPE = 'sales:pos.categoryMapping';

export const POS_CUSTOMER_FIELD_CONTENT_TYPE = 'sales:pos.customerField';

export const POS_CUSTOMER_LAYOUT_CONTENT_TYPE = 'sales:pos.customerLayout';

const POS_EDIT_RECORD_PAGES: Record<
  string,
  { slug: string; tab: string; keyField: string }
> = {
  [POS_CARD_CONFIG_CONTENT_TYPE]: {
    slug: 'card-config',
    tab: 'sync',
    keyField: 'configKey',
  },
  [POS_CATEGORY_MAPPING_CONTENT_TYPE]: {
    slug: 'category-mapping',
    tab: 'product',
    keyField: 'mappingId',
  },
};

export const getPosEditRecordPath =
  (contentType: string) => (defaults: Record<string, unknown>) => {
    const page = POS_EDIT_RECORD_PAGES[contentType];
    const { posId } = defaults;
    const recordKey = page ? defaults[page.keyField] : undefined;

    return page &&
      typeof posId === 'string' &&
      typeof recordKey === 'string' &&
      recordKey
      ? `/sales/settings/pos/${posId}/edit/${page.slug}/${encodeURIComponent(
          recordKey,
        )}`
      : null;
  };

export const getPosEditRecordPage = (slug: string) => {
  const contentType = Object.keys(POS_EDIT_RECORD_PAGES).find(
    (type) => POS_EDIT_RECORD_PAGES[type].slug === slug,
  );

  return contentType
    ? { contentType, ...POS_EDIT_RECORD_PAGES[contentType] }
    : null;
};

export const POS_PANEL_INPUT_CLASS_NAME = `${PANEL_INPUT_CLASS_NAME} focus-visible:shadow-none hover:bg-accent focus-visible:bg-accent`;

export const POS_PANEL_FIELDS_CLASS_NAME = [
  '[&_input]:shadow-none',
  '[&_textarea]:shadow-none',
  '[&_[role=combobox]]:shadow-none',
  '[&_[cmdk-root]>div]:shadow-none',
  '[&_input:not(:disabled,[cmdk-input]):hover]:bg-accent',
  '[&_textarea:not(:disabled):hover]:bg-accent',
  '[&_[role=combobox]:not(:disabled):hover]:bg-accent',
].join(' ');
