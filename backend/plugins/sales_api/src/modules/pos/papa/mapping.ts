import {
  PAPA_CAR_TYPE_GROUPS,
  PAPA_MAX_EVENTS,
  PAPA_SIZES,
  TPapaCarTypeGroup,
  TPapaSize,
} from './constants';
import {
  IPapaDelivery,
  IPapaDeliveryEvent,
  IPapaDynamicCreateInput,
  IPapaDynamicOrder,
  IPapaQuote,
  IPapaShipping,
  IPosPapaConfig,
} from './types';

const MAX_CARGO_NAME = 255;
const MAX_DESCRIPTION = 500;

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

export const quoteToDelivery = (
  quote: IPapaQuote,
  now: Date,
): Partial<IPapaDelivery> => ({
  quoteId: quote.id,
  quoteExpiresAt: quote.expire_timestamp
    ? new Date(quote.expire_timestamp * 1000)
    : undefined,
  price: Number(quote.user_price),
  distance: quote.distance,
  duration: quote.duration,
  toLocationId: quote.to_location_id,
  toAddress: quote.to_address,
  toLatitude: String(quote.to_latitude),
  toLongitude: String(quote.to_longitude),
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

  const note = (description || '').trim().slice(0, MAX_DESCRIPTION);

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
  isPaid: order.is_paid,
  unpaidAmount: order.unpaid_amount,
  cargoId: order.cargo?.id,
  cargoStatus: order.cargo?.cargo_status,
  shippingId: order.cargo?.shipping_id ?? null,
  driver: order.driver_info ?? null,
  car: order.car_info ?? null,
  updatedAt: now,
});

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
) => `${gatewayDomain.replace(/\/+$/, '')}/pl:sales${callbackPath}/${secret}`;
