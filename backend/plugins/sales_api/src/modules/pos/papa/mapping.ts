import {
  PAPA_CAR_TYPE_GROUPS,
  PAPA_DEAL_STEP_BY_STATUS,
  PAPA_DEAL_STEP_RANK,
  PAPA_DELIVERED_STATUSES,
  PAPA_DRIVER_NOTE_MAX,
  PAPA_ENDED_ORDER_STATUSES,
  PAPA_MAX_EVENTS,
  PAPA_SIZES,
  TPapaCarTypeGroup,
  TPapaAutoSendMissing,
  TPapaDealStep,
  TPapaSize,
} from './constants';
import {
  IPapaDealLink,
  IPapaDelivery,
  IPapaDeliveryEvent,
  IPapaDynamicCreateInput,
  IPapaDynamicOrder,
  IPapaNoteItem,
  IPapaQuote,
  IPapaShipping,
  IPosPapaConfig,
} from './types';

const MAX_CARGO_NAME = 255;

/** Drops trailing slashes without a regex (Sonar flags `/\/+$/` for backtracking). */
export const trimTrailingSlashes = (value: string) => {
  let end = value.length;

  while (end > 0 && value[end - 1] === '/') {
    end -= 1;
  }

  return value.slice(0, end);
};

/** Expands the POS's UI car-type groups into Papa `car_type` values. */
export const expandCarTypes = (groups?: string[]): string[] => {
  const selected = (groups || []).filter(
    (group): group is TPapaCarTypeGroup => group in PAPA_CAR_TYPE_GROUPS,
  );

  const effective: TPapaCarTypeGroup[] = selected.length
    ? selected
    : ['car', 'light'];

  return Array.from(
    new Set(effective.flatMap((group) => PAPA_CAR_TYPE_GROUPS[group])),
  );
};

export const isPapaSize = (value: unknown): value is TPapaSize =>
  typeof value === 'string' &&
  (PAPA_SIZES as readonly string[]).includes(value);

/**
 * Normalizes a phone to the 8-digit Mongolian format Papa validates.
 * Accepts spaces, dashes and a +976 / 976 prefix. Returns undefined when the
 * value cannot be a Mongolian mobile number.
 */
export const normalizeMnPhone = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  let digits = value.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('976')) {
    digits = digits.slice(3);
  }

  return /^\d{8}$/.test(digits) ? digits : undefined;
};

export const isValidCoordinate = (value: unknown, limit: number) => {
  const num = Number(value);
  return (
    value !== '' &&
    value !== null &&
    Number.isFinite(num) &&
    Math.abs(num) <= limit
  );
};

/** `fallback` is what erxes asked for; the example-shaped quote may omit it. */
export const quoteToDelivery = (
  quote: IPapaQuote,
  now: Date,
  fallback: {
    toLocationId: string;
    toAddress: string;
    toLatitude: string;
    toLongitude: string;
  },
): Partial<IPapaDelivery> => ({
  quoteId: quote.id,
  quoteExpiresAt: quote.expire_timestamp
    ? new Date(quote.expire_timestamp * 1000)
    : undefined,
  price: Number(quote.user_price),
  distance: quote.distance,
  duration: quote.duration,
  toLocationId: quote.to_location_id || fallback.toLocationId,
  toAddress: fallback.toAddress,
  toLatitude: fallback.toLatitude,
  toLongitude: fallback.toLongitude,
  size: quote.size,
  updatedAt: now,
});

export const buildDynamicCreateInput = ({
  orderId,
  orderNumber,
  quoteId,
  staffId,
  posConfig,
  receiverPhone,
  description,
  receiverPays,
}: {
  orderId: string;
  orderNumber: string;
  quoteId: string;
  staffId: string;
  posConfig: IPosPapaConfig;
  receiverPhone: string;
  description?: string;
  receiverPays?: boolean;
}): IPapaDynamicCreateInput => {
  if (!posConfig.categoryId || !posConfig.conditionId) {
    throw new Error('Papa category and condition must be set on the POS');
  }

  const note = (description || '').trim().slice(0, PAPA_DRIVER_NOTE_MAX);

  return {
    quote_id: quoteId,
    staff_id: staffId,
    reference_id: orderId,
    car_type: expandCarTypes(posConfig.carTypeGroups),
    category_id: posConfig.categoryId,
    condition_id: posConfig.conditionId,
    ...(note ? { is_description: true, description: note } : {}),
    cargo: {
      reference_id: orderId,
      name: `Order ${orderNumber}`.slice(0, MAX_CARGO_NAME),
      quantity: 1,
      weigth_type: 'BOX',
      other_receive_phone: receiverPhone,
      is_other_receive_pay: Boolean(receiverPays),
    },
  };
};

/** Projects a Papa dynamic order onto the sales-owned delivery state. */
export const orderToDelivery = (
  order: IPapaDynamicOrder,
  now: Date,
): Partial<IPapaDelivery> => ({
  status: order.parcel_order_status,
  papaOrderId: order.id,
  code: order.code,
  pincode: order.pincode,
  price: order.amount ?? order.cargo?.user_price,
  // Papa's `is_paid` means "can be paid now", not "paid" (Papa confirmed);
  // an order is paid once it is COMPLETED or nothing is left unpaid.
  isPaid:
    order.parcel_order_status === 'COMPLETED' ||
    (order.unpaid_amount !== undefined &&
      order.unpaid_amount !== null &&
      Number(order.unpaid_amount) === 0),
  unpaidAmount:
    order.unpaid_amount === undefined || order.unpaid_amount === null
      ? undefined
      : Number(order.unpaid_amount),
  cargoId: order.cargo?.id,
  cargoStatus: order.cargo?.cargo_status,
  shippingId: order.cargo?.shipping_id ?? null,
  driver: order.driver_info ?? null,
  car: order.car_info ?? null,
  updatedAt: now,
});

// Only a date that states its zone is trusted: a zoneless Papa time would be
// read in the server's zone and land hours off.
const ZONED_DATE = /T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/;

/** When Papa says the order reached its status, or `fallback`. */
export const papaStatusDate = (order: IPapaDynamicOrder, fallback: Date) => {
  const value = order.parcel_order_status_date;
  const date = value && ZONED_DATE.test(value) ? new Date(value) : undefined;

  return date && !Number.isNaN(date.getTime()) ? date : fallback;
};

/**
 * A refreshed delivery: Papa's latest state over the stored one. Papa drops
 * the driver and vehicle once an order is over, so the last known ones stay;
 * the delivered and closed times are kept from the first time they were seen.
 */
export const mergeRefreshedDelivery = (
  current: IPapaDelivery,
  fresh: Partial<IPapaDelivery>,
  statusAt: Date,
): IPapaDelivery => {
  const next: IPapaDelivery = {
    ...current,
    ...fresh,
    driver: fresh.driver || current.driver || null,
    car: fresh.car || current.car || null,
  };

  if (PAPA_DELIVERED_STATUSES.includes(next.status) && !current.deliveredAt) {
    next.deliveredAt = statusAt;
  }

  if (PAPA_ENDED_ORDER_STATUSES.includes(next.status) && !current.closedAt) {
    next.closedAt = statusAt;
  }

  return next;
};

/**
 * The driver note sent as Papa's `description`: the receiver, the store's
 * note, then the order lines. Papa has no field for the receiver's name or
 * the goods, so they travel in the note; when it is too long the item list is
 * shortened first.
 */
export const buildDriverNote = (
  {
    receiverName,
    note,
    items,
  }: { receiverName?: string; note?: string; items: IPapaNoteItem[] },
  max = PAPA_DRIVER_NOTE_MAX,
) => {
  const head = [
    receiverName?.trim() ? `Хүлээн авагч: ${receiverName.trim()}` : '',
    note?.trim() || '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, max);
  const itemText = items
    .filter((item) => item.name && item.quantity > 0)
    .map((item) => `${item.name} ×${item.quantity}`)
    .join(', ');

  if (!itemText) {
    return head;
  }

  const itemsLine = `Бараа: ${itemText}`;
  const room = max - head.length - (head ? 1 : 0);

  if (room < 12) {
    return head;
  }

  const fitted =
    itemsLine.length <= room ? itemsLine : `${itemsLine.slice(0, room - 1)}…`;

  return head ? `${head}\n${fitted}` : fitted;
};

export const shippingToDelivery = (
  shipping: IPapaShipping,
): Partial<IPapaDelivery> => ({
  endPincode: shipping.end_pincode ?? null,
  hasPhotoProof: Boolean(shipping.is_approve_image),
});

export const appendEvent = (
  events: IPapaDeliveryEvent[] | undefined,
  event: IPapaDeliveryEvent,
): IPapaDeliveryEvent[] => [...(events || []), event].slice(-PAPA_MAX_EVENTS);

/** Builds the callback URL Papa calls; the secret path segment authenticates it. */
export const buildCallbackUrl = (
  gatewayDomain: string,
  callbackPath: string,
  secret: string,
) => `${trimTrailingSlashes(gatewayDomain)}/pl:sales${callbackPath}/${secret}`;

/** The pipeline step a Papa status stands for, if any. */
export const papaDealStep = (status?: string): TPapaDealStep | undefined =>
  status ? PAPA_DEAL_STEP_BY_STATUS[status] : undefined;

/**
 * Whether a deal at `link` moves to `step` for Papa order `papaOrderId`:
 * forward only within one Papa order, while a resend starts over.
 */
export const shouldMoveDeal = (
  link: IPapaDealLink | undefined,
  step: TPapaDealStep,
  papaOrderId: string,
) =>
  !link?.step ||
  link.papaOrderId !== papaOrderId ||
  PAPA_DEAL_STEP_RANK[step] > PAPA_DEAL_STEP_RANK[link.step];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const textOf = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeDistrict = (value: string) =>
  value
    .toLowerCase()
    .replace(/дүүрэг|district/g, '')
    .replace(/[\s-]+/g, '');

/**
 * The Papa location of a checkout district ("Хан-Уул", "Баянзүрх дүүрэг"),
 * by full or short name; only when exactly one location matches.
 */
export const matchPapaLocation = (
  district: string,
  locations: unknown[],
): string | undefined => {
  const wanted = normalizeDistrict(district);

  if (!wanted) {
    return undefined;
  }

  const matches = locations.filter(
    (row) =>
      isRecord(row) &&
      (typeof row.id === 'string' || typeof row.id === 'number') &&
      [row.name, row.code, row.title, row.short_name].some(
        (label) =>
          typeof label === 'string' && normalizeDistrict(label) === wanted,
      ),
  );

  return matches.length === 1 && isRecord(matches[0])
    ? String(matches[0].id)
    : undefined;
};

const coordinateText = (value: unknown, limit: number) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return isValidCoordinate(value, limit) ? String(Number(value)) : undefined;
};

/**
 * The checkout's map pin: `marker`, then `location`, then top-level fields,
 * each as `latitude`/`longitude`, `lat`/`lng` or GeoJSON `coordinates`
 * `[longitude, latitude]`. Both coordinates come from the same place.
 */
export const readDeliveryPin = (
  deliveryInfo: unknown,
): { lat: string; lng: string } | null => {
  if (!isRecord(deliveryInfo)) {
    return null;
  }

  for (const pin of [
    deliveryInfo.marker,
    deliveryInfo.location,
    deliveryInfo,
  ]) {
    if (!isRecord(pin)) {
      continue;
    }

    const coordinates = Array.isArray(pin.coordinates) ? pin.coordinates : [];
    const lat = coordinateText(pin.latitude ?? pin.lat ?? coordinates[1], 90);
    const lng = coordinateText(pin.longitude ?? pin.lng ?? coordinates[0], 180);

    if (lat && lng) {
      return { lat, lng };
    }
  }

  return null;
};

const DELIVERY_NOTE_FLAGS = [
  ['haveBaby', 'Нялх хүүхэдтэй'],
  ['callBefore', 'Хүргэхийн өмнө заавал залгах'],
  ['onlyAfternoon', 'Зөвхөн оройн цагаар хүргэх'],
] as const;

export interface IPapaAutoSendPlan {
  quote: {
    toLocationId: string;
    toAddress: string;
    toLatitude: string;
    toLongitude: string;
    size?: TPapaSize;
  } | null;
  send: { receiverName?: string; receiverPhone?: string; description?: string };
  missing: TPapaAutoSendMissing[];
}

/**
 * What an automatic send would quote and send for a checkout's
 * `deliveryInfo`, or which parts are missing: Papa needs a district it
 * knows, an address, a map pin and the receiver's phone.
 */
export const planPapaAutoSend = (
  deliveryInfo: unknown,
  locations: unknown[],
  size?: TPapaSize,
): IPapaAutoSendPlan => {
  const info = isRecord(deliveryInfo) ? deliveryInfo : {};
  const district = textOf(info.district);
  const address =
    textOf(info.address) ||
    [info.city, info.district, info.street, info.detail]
      .map(textOf)
      .filter(Boolean)
      .join(', ');
  const toLocationId = matchPapaLocation(district, locations);
  const pin = readDeliveryPin(info);
  const receiverPhone = normalizeMnPhone(textOf(info.phone));
  const receiverName =
    textOf(info.receiverName) ||
    textOf(info.name) ||
    [info.lastName, info.firstName].map(textOf).filter(Boolean).join(' ');
  const description = [
    textOf(info.description),
    ...DELIVERY_NOTE_FLAGS.flatMap(([key, label]) =>
      info[key] === true ? [label] : [],
    ),
  ]
    .filter(Boolean)
    .join('. ');

  const missing: TPapaAutoSendMissing[] = [];

  if (!toLocationId) missing.push('district');
  if (!address) missing.push('address');
  if (!pin) missing.push('pin');
  if (!receiverPhone) missing.push('phone');

  return {
    quote:
      toLocationId && address && pin
        ? {
            toLocationId,
            toAddress: address.slice(0, 500),
            toLatitude: pin.lat,
            toLongitude: pin.lng,
            size,
          }
        : null,
    send: {
      receiverName: receiverName || undefined,
      receiverPhone,
      description: description || undefined,
    },
    missing,
  };
};
