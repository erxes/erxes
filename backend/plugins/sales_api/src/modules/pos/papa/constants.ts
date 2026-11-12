export const PAPA_DEV_API_URL = 'https://dev-api.papa.mn/api/v4';

export const PAPA_REQUEST_TIMEOUT_MS = 15_000;

// Papa does not document the token lifetime; refresh well before an hour.
export const PAPA_TOKEN_TTL_SECONDS = 45 * 60;

export const PAPA_REFERENCES_TTL_SECONDS = 24 * 60 * 60;

export const PAPA_CALLBACK_PATH = '/papa-callback';

/**
 * UI groups a POS exposes for Papa vehicle selection. Each expands to the Papa
 * `car_type` values sent when an order is created.
 */
export const PAPA_CAR_TYPE_GROUPS = {
  car: ['PASSANGER_CAR'],
  light: ['ON_FOOT', 'MOPED', 'BICYCLE'],
} as const;

export type TPapaCarTypeGroup = keyof typeof PAPA_CAR_TYPE_GROUPS;

export const PAPA_SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'BIG'] as const;

export type TPapaSize = (typeof PAPA_SIZES)[number];

export const PAPA_WEIGHT_TYPES = ['KG', 'T', 'M3', 'BOX', 'UNIT', 'L'] as const;

export type TPapaWeightType = (typeof PAPA_WEIGHT_TYPES)[number];

/** Local lifecycle values stored before Papa owns the order. */
export const PAPA_LOCAL_STATUS = {
  QUOTED: 'QUOTED',
  SENDING: 'SENDING',
  FAILED: 'FAILED',
} as const;

/** Papa parcel order statuses (`parcel_order_status`). */
export const PAPA_ORDER_STATUS = {
  NEW: 'NEW',
  CONFIRM: 'CONFIRM',
  CREATING_SHIPPING: 'CREATING_SHIPPING',
  START: 'START',
  END: 'END',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  USER_CANCELLED: 'USER_CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

/** States from which a new quote and a new send are allowed. */
export const PAPA_RESENDABLE_STATUSES: string[] = [
  PAPA_LOCAL_STATUS.QUOTED,
  PAPA_LOCAL_STATUS.FAILED,
  PAPA_ORDER_STATUS.CANCELLED,
  PAPA_ORDER_STATUS.USER_CANCELLED,
  PAPA_ORDER_STATUS.EXPIRED,
];

/** States in which the delivery can still be cancelled from erxes. */
export const PAPA_CANCELLABLE_STATUSES: string[] = [
  PAPA_ORDER_STATUS.NEW,
  PAPA_ORDER_STATUS.CONFIRM,
  PAPA_ORDER_STATUS.CREATING_SHIPPING,
];

export const PAPA_CALLBACK_OBJECT_TYPES = [
  'PARCEL_ORDER',
  'CARGO',
  'REQUEST',
] as const;

export const PAPA_MAX_EVENTS = 50;

export const PAPA_LIST_PAGE_SIZE = 20;

// Papa's docs send this app-version header on many organization endpoints
// (shipping, approve image, cancel, invoices); every request carries it.
export const PAPA_UPDATE_VERSION_HEADER = 'ios/1.1.1';

/** Order statuses in which the cargo has (or had) a shipping. */
export const PAPA_SHIPPING_STATUSES: string[] = [
  'CREATING_SHIPPING',
  'START',
  'END',
  'COMPLETED',
];

// Pickup addresses are a handful per business; stop paging well before this.
export const PAPA_MAX_ADDRESS_PAGES = 10;
