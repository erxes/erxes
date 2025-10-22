export const PRODUCT_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  SUBSCRIPTION:"subscription",
  ALL: ['product', 'service','subscription'],
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export const PRODUCT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived'],
};

export const ORDER_TYPES = {
  TAKE: 'take',
  EAT: 'eat',
  SAVE: 'save',
  DELIVERY: 'delivery',
  SPEND: 'spend',
  LOSS: 'loss',
  REJECT: 'reject',
  ALL: ['take', 'eat', 'delivery', 'save', 'spend', 'loss', 'reject'],
  SALES: ['take', 'eat', 'delivery', 'save'],
  OUT: ['spend', 'loss', 'reject'],
};

// НӨАТ-н баримтын төрөл
export const BILL_TYPES = {
  CITIZEN: '1', // иргэнд өгөх баримт
  ENTITY: '3', // байгууллагад өгөх баримт
  INVOICE: '5', // нэхэмжлэхээр өгөх баримт
  INNER: '9', // дотоод буюу түр
  ALL: ['1', '3', '9', null],
};

export const ORDER_RETURN_TYPES = {
  HARD: 'hard',
  SALE: 'sale',
  SOFT: 'soft',
};

export const ORDER_STATUSES = {
  NEW: 'new',
  DOING: 'doing',
  REDOING: 'reDoing',
  DONE: 'done',
  COMPLETE: 'complete',
  PENDING: 'pending',
  RETURN: 'return',

  ALL: ['new', 'doing', 'done', 'complete', 'reDoing', 'pending', 'return'],
  FULL: ['paid', 'done', 'complete'],
};

export const ORDER_SALE_STATUS = {
  CART: 'cart',
  CONFIRMED: 'confirmed',
  ALL: ['cart', 'confirmed'],
};

export const ORDER_ITEM_STATUSES = {
  NEW: 'new',
  CONFIRM: 'confirm',
  DONE: 'done',

  ALL: ['new', 'done', 'confirm'],
};

export const ORDER_ORIGINS = {
  POS: '',
  KIOSK: 'kiosk',
  ALL: ['', 'kiosk'],
};

export const SUBSCRIPTION_INFO_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  DONE: 'done',
  ALL: ['active', 'done', 'cancellled'],
};
