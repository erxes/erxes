export const PAPA_DEV_API_URL = 'https://dev-api.papa.mn/api/v4';

/** Credentials are only ever sent to Papa's own hosts (papa.mn and its subdomains). */
export const PAPA_TRUSTED_HOST = 'papa.mn';

/** Papa orders that can no longer be the live order behind an erxes order. */
export const PAPA_ENDED_ORDER_STATUSES = [
  'CANCELLED',
  'USER_CANCELLED',
  'EXPIRED',
];

/** At most this many same-named candidates are checked by their dynamic get. */
export const PAPA_ORDER_LOOKUP_LIMIT = 3;

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

/** Papa has delivered the goods (END: fee not yet settled, COMPLETED: settled). */
export const PAPA_DELIVERED_STATUSES: string[] = [
  PAPA_ORDER_STATUS.END,
  PAPA_ORDER_STATUS.COMPLETED,
];

/** Driver note limits: Papa's `description` and each part erxes adds to it. */
export const PAPA_DRIVER_NOTE_MAX = 500;
export const PAPA_RECEIVER_NAME_MAX = 100;
export const PAPA_CANCEL_REASON_MAX = 300;

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

/** Pipeline steps a Papa delivery moves its deal through. */
export const PAPA_DEAL_STEPS = [
  'sent',
  'inTransit',
  'delivered',
  'cancelled',
  'failed',
] as const;

export type TPapaDealStep = (typeof PAPA_DEAL_STEPS)[number];

/** Papa status → deal step; statuses not listed (NEW, local ones) move nothing. */
export const PAPA_DEAL_STEP_BY_STATUS: Record<string, TPapaDealStep> = {
  [PAPA_ORDER_STATUS.CONFIRM]: 'sent',
  [PAPA_ORDER_STATUS.CREATING_SHIPPING]: 'inTransit',
  [PAPA_ORDER_STATUS.START]: 'inTransit',
  [PAPA_ORDER_STATUS.END]: 'delivered',
  [PAPA_ORDER_STATUS.COMPLETED]: 'delivered',
  [PAPA_ORDER_STATUS.USER_CANCELLED]: 'cancelled',
  [PAPA_ORDER_STATUS.CANCELLED]: 'failed',
  [PAPA_ORDER_STATUS.EXPIRED]: 'failed',
};

/** A deal only moves forward for one Papa order; the last three are final. */
export const PAPA_DEAL_STEP_RANK: Record<TPapaDealStep, number> = {
  sent: 1,
  inTransit: 2,
  delivered: 3,
  cancelled: 3,
  failed: 3,
};

// A deal create that has not finished within this is taken as crashed.
export const PAPA_DEAL_CREATE_LOCK_MS = 60_000;

/** What a delivery order lacked when it could not be sent automatically. */
export const PAPA_AUTO_SEND_MISSING = [
  'district',
  'address',
  'pin',
  'phone',
] as const;

export type TPapaAutoSendMissing = (typeof PAPA_AUTO_SEND_MISSING)[number];
