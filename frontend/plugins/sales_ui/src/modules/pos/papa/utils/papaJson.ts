import { z } from 'zod';

const text = z.string().nullish();
const numeric = z.union([z.number(), z.string()]).nullish();
const idValue = z.union([z.string(), z.number()]).transform(String);

export const PAPA_SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'BIG'] as const;
export type TPapaSize = (typeof PAPA_SIZES)[number];

export const PAPA_CAR_TYPE_GROUPS = ['car', 'light'] as const;
export type TPapaCarTypeGroup = (typeof PAPA_CAR_TYPE_GROUPS)[number];

/** Delivery steps that move the order's deal (`deliveryConfig.papa.stageIds`). */
export const PAPA_DEAL_STEPS = [
  'sent',
  'inTransit',
  'delivered',
  'cancelled',
  'failed',
] as const;
export type TPapaDealStep = (typeof PAPA_DEAL_STEPS)[number];

export type TPapaStageIds = Record<TPapaDealStep, string>;

export const EMPTY_PAPA_STAGE_IDS: TPapaStageIds = {
  sent: '',
  inTransit: '',
  delivered: '',
  cancelled: '',
  failed: '',
};

/** Statuses from which erxes can quote and send again. */
export const PAPA_RESENDABLE_STATUSES = [
  'QUOTED',
  'FAILED',
  'CANCELLED',
  'USER_CANCELLED',
  'EXPIRED',
];

/** Statuses Papa can still change; the panel polls while in one of them. */
export const PAPA_ACTIVE_STATUSES = [
  'SENDING',
  'NEW',
  'CONFIRM',
  'CREATING_SHIPPING',
  'START',
];

export const PAPA_CANCELLABLE_STATUSES = [
  'NEW',
  'CONFIRM',
  'CREATING_SHIPPING',
];

// `deliveryConfig.papa` on the POS (non-secret settings only).
export const posPapaConfigSchema = z
  .object({
    enabled: z.boolean().nullish(),
    autoSend: z.boolean().nullish(),
    addressId: text,
    carTypeGroups: z.array(z.enum(PAPA_CAR_TYPE_GROUPS)).nullish(),
    categoryId: text,
    conditionId: text,
    size: z.enum(PAPA_SIZES).nullish(),
    stageIds: z
      .object({
        sent: text,
        inTransit: text,
        delivered: text,
        cancelled: text,
        failed: text,
      })
      .nullish(),
  })
  .passthrough();

export type TPosPapaConfig = z.infer<typeof posPapaConfigSchema>;

const personSchema = z
  .object({
    firstname: text,
    lastname: text,
    phone: text,
    latitude: numeric,
    longitude: numeric,
  })
  .passthrough();

const carSchema = z
  .object({
    type: text,
    capacity: text,
    plate: text,
    image: text,
  })
  .passthrough();

// `posOrder.papaDelivery`, written only by the Sales API.
export const papaDeliverySchema = z
  .object({
    status: z.string(),
    quoteId: text,
    quoteExpiresAt: text,
    price: numeric,
    distance: numeric,
    duration: numeric,
    toLocationId: text,
    toAddress: text,
    toLatitude: numeric,
    toLongitude: numeric,
    size: text,
    papaOrderId: text,
    code: text,
    pincode: text,
    endPincode: text,
    cargoId: text,
    shippingId: text,
    hasPhotoProof: z.boolean().nullish(),
    isPaid: z.boolean().nullish(),
    unpaidAmount: numeric,
    driver: personSchema.nullish(),
    car: carSchema.nullish(),
    carTypes: z.array(z.string()).nullish(),
    error: text,
    createUncertain: z.boolean().nullish(),
    sentAt: text,
    receiverName: text,
    receiverPhone: text,
    deliveredAt: text,
    closedAt: text,
    cancelReason: text,
    updatedAt: text,
  })
  .passthrough();

export type TPapaDelivery = z.infer<typeof papaDeliverySchema>;

// `posOrder.papaAutoSend`: how the automatic send of the order went.
const papaAutoSendSchema = z
  .object({
    status: z.enum(['sending', 'sent', 'skipped', 'failed']),
    at: text,
    missing: z.array(z.string()).nullish(),
    error: text,
  })
  .passthrough();

export type TPapaAutoSend = z.infer<typeof papaAutoSendSchema>;

export const parsePapaAutoSend = (value: unknown): TPapaAutoSend | null => {
  const parsed = papaAutoSendSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

/** What an order lacked for an automatic send, as translation key and text. */
export const PAPA_AUTO_SEND_MISSING: Record<string, [string, string]> = {
  district: ['papa-missing-district', 'a district Papa knows'],
  address: ['papa-missing-address', 'an address'],
  pin: ['papa-missing-pin', 'a map pin'],
  phone: ['papa-missing-phone', 'the receiver’s phone'],
};

/** Why a Papa order ended without delivery, as a translation key and text. */
export const PAPA_CLOSE_REASONS: Record<string, [string, string]> = {
  USER_CANCELLED: ['papa-closed-by-store', 'Cancelled by the store'],
  CANCELLED: ['papa-closed-by-papa', 'Cancelled by Papa'],
  EXPIRED: ['papa-closed-expired', 'No driver accepted it in time'],
};

// `salesPapaDeliveryReport`: deliveries per day or month.
const reportCountsSchema = z.object({
  sent: z.number(),
  delivered: z.number(),
  cancelled: z.number(),
  failed: z.number(),
  inProgress: z.number(),
  revenue: z.number(),
  papaCost: z.number(),
});

export const papaReportSchema = z.object({
  interval: z.enum(['day', 'month']),
  rows: z.array(reportCountsSchema.extend({ period: z.string() })),
  totals: reportCountsSchema,
});

export type TPapaReport = z.infer<typeof papaReportSchema>;
export type TPapaReportCounts = z.infer<typeof reportCountsSchema>;

// Papa reference rows (`app/init`); Papa does not document their exact shape,
// so only an id and a display name are required.
const referenceRowSchema = z
  .object({
    id: idValue,
    name: text,
    title: text,
    code: text,
    short_name: text,
    is_active: z.boolean().nullish(),
    parent_id: z.union([z.string(), z.number()]).nullish(),
  })
  .passthrough();

export type TPapaReferenceRow = z.infer<typeof referenceRowSchema>;

const referenceListSchema = z
  .array(z.unknown())
  .nullish()
  .transform((rows) =>
    (rows || []).flatMap((row) => {
      const parsed = referenceRowSchema.safeParse(row);
      // Papa marks retired categories and conditions `is_active: false`.
      return parsed.success && parsed.data.is_active !== false
        ? [parsed.data]
        : [];
    }),
  );

export const papaReferencesSchema = z
  .object({
    locations: referenceListSchema,
    categories: referenceListSchema,
    conditions: referenceListSchema,
  })
  .passthrough();

export type TPapaReferences = z.infer<typeof papaReferencesSchema>;

export const papaAddressSchema = z
  .object({
    id: idValue,
    address: text,
    location_id: z.union([z.string(), z.number()]).nullish(),
  })
  .passthrough();

export type TPapaAddress = z.infer<typeof papaAddressSchema>;

export const papaPhotoProofSchema = z
  .object({
    id: idValue,
    image: text,
    other_receive_name: text,
    other_receive_phone: text,
    description: text,
    approve_image_status: text,
  })
  .passthrough();

export const referenceLabel = (row: TPapaReferenceRow) =>
  row.name || row.title || row.code || row.id;

/** Location label with its parent (district › khoroo) when Papa nests them. */
export const locationLabel = (
  row: TPapaReferenceRow,
  rows: TPapaReferenceRow[],
) => {
  const parent =
    row.parent_id != null
      ? rows.find((candidate) => candidate.id === String(row.parent_id))
      : undefined;

  return parent
    ? `${referenceLabel(parent)} › ${referenceLabel(row)}`
    : referenceLabel(row);
};

// `posOrder.papaDeal`: the delivery deal Papa statuses move.
const papaDealSchema = z
  .object({ dealId: text, step: text, error: text })
  .passthrough();

export type TPapaDeal = z.infer<typeof papaDealSchema>;

export const parsePapaDeal = (value: unknown): TPapaDeal | null => {
  const parsed = papaDealSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

export const parsePapaDelivery = (value: unknown): TPapaDelivery | null => {
  const parsed = papaDeliverySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

// `salesPapaWallet`: the business wallet Papa takes delivery fees from.
export const papaWalletSchema = z
  .object({
    code: text,
    balance: z.number(),
    hold: z.number(),
    available: z.number(),
    allowNegative: z.boolean().nullish(),
    status: text,
  })
  .passthrough();

export type TPapaWallet = z.infer<typeof papaWalletSchema>;

export const parsePapaWallet = (value: unknown): TPapaWallet | null => {
  const parsed = papaWalletSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

/** Papa takes the fee from the wallet when a delivery ends; can it cover this one? */
export const isPapaWalletShort = (
  wallet: TPapaWallet | null,
  amount: unknown,
) => {
  const needed = Number(amount);

  return (
    !!wallet &&
    !wallet.allowNegative &&
    Number.isFinite(needed) &&
    needed > 0 &&
    wallet.available < needed
  );
};

export const parsePosPapaConfig = (value: unknown): TPosPapaConfig => {
  const parsed = posPapaConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : {};
};

export const parsePapaReferences = (value: unknown): TPapaReferences =>
  papaReferencesSchema.parse(value ?? {});

export const parsePapaAddresses = (value: unknown): TPapaAddress[] =>
  z
    .array(z.unknown())
    .nullish()
    .parse(value)
    ?.flatMap((row) => {
      const parsed = papaAddressSchema.safeParse(row);
      return parsed.success ? [parsed.data] : [];
    }) ?? [];

// dts.mn checkout flags, written into the driver note in the site's wording.
const DELIVERY_NOTE_FLAGS = [
  ['haveBaby', 'Нялх хүүхэдтэй'],
  ['callBefore', 'Хүргэхийн өмнө заавал залгах'],
  ['onlyAfternoon', 'Зөвхөн оройн цагаар хүргэх'],
] as const;

// A map pin as a checkout may send it: `{ latitude, longitude }`,
// `{ lat, lng }` or GeoJSON `{ coordinates: [longitude, latitude] }`. A
// malformed pin is ignored rather than failing the whole address.
const pinSchema = z
  .object({
    lat: numeric,
    lng: numeric,
    latitude: numeric,
    longitude: numeric,
    coordinates: z.array(numeric).nullish(),
  })
  .passthrough()
  .nullish()
  .catch(null);

const deliveryInfoSchema = z
  .object({
    address: text,
    phone: text,
    description: text,
    // Who receives the goods, when the checkout asks for it.
    receiverName: text,
    name: text,
    firstName: text,
    lastName: text,
    // Ecommerce checkouts (dts.mn) send the address in parts.
    city: text,
    district: text,
    street: text,
    detail: text,
    haveBaby: z.boolean().nullish(),
    callBefore: z.boolean().nullish(),
    onlyAfternoon: z.boolean().nullish(),
    marker: pinSchema,
    location: pinSchema,
    lat: numeric.catch(null),
    lng: numeric.catch(null),
    latitude: numeric.catch(null),
    longitude: numeric.catch(null),
  })
  .passthrough();

type TPin = z.infer<typeof pinSchema>;

const inRange = (value: unknown, limit: number) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit
    ? String(number)
    : undefined;
};

/**
 * The checkout's pin: `marker`, then `location`, then top-level fields.
 * Both coordinates must come from the same place and be in range.
 */
export const readDeliveryPin = (
  pins: TPin[],
): { lat: string; lng: string } | null => {
  for (const pin of pins) {
    const lat = inRange(pin?.latitude ?? pin?.lat ?? pin?.coordinates?.[1], 90);
    const lng = inRange(
      pin?.longitude ?? pin?.lng ?? pin?.coordinates?.[0],
      180,
    );

    if (lat && lng) {
      return { lat, lng };
    }
  }

  return null;
};

export interface IOrderDeliveryDefaults {
  address: string;
  district: string;
  phone: string;
  receiverName: string;
  description: string;
  lat: string;
  lng: string;
}

const join = (parts: (string | null | undefined)[], separator: string) =>
  parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(separator);

/** Reads the delivery address the POS or ecommerce checkout saved on the order. */
export const orderDeliveryDefaults = (
  deliveryInfo: unknown,
): IOrderDeliveryDefaults => {
  const parsed = deliveryInfoSchema.safeParse(deliveryInfo ?? {});

  if (!parsed.success) {
    return {
      address: '',
      district: '',
      phone: '',
      receiverName: '',
      description: '',
      lat: '',
      lng: '',
    };
  }

  const info = parsed.data;
  const notes = DELIVERY_NOTE_FLAGS.flatMap(([key, label]) =>
    info[key] ? [label] : [],
  );
  const pin = readDeliveryPin([
    info.marker,
    info.location,
    {
      lat: info.lat,
      lng: info.lng,
      latitude: info.latitude,
      longitude: info.longitude,
    },
  ]);

  return {
    address:
      info.address ||
      join([info.city, info.district, info.street, info.detail], ', '),
    district: info.district || '',
    phone: info.phone || '',
    receiverName:
      info.receiverName ||
      info.name ||
      join([info.lastName, info.firstName], ' '),
    description: join([info.description, ...notes], '. '),
    lat: pin?.lat ?? '',
    lng: pin?.lng ?? '',
  };
};

const normalizeDistrict = (value: string) =>
  value
    .toLowerCase()
    .replace(/дүүрэг|district/g, '')
    .replace(/[\s-]+/g, '');

/**
 * Finds the Papa location for a checkout district name ("Хан-Уул" →
 * "Хан-Уул", "Баянзүрх" → "Баянзүрх дүүрэг"), by full or short name.
 */
export const matchPapaDistrict = (
  district: string,
  locations: TPapaReferenceRow[],
): string | undefined => {
  const wanted = normalizeDistrict(district);

  if (!wanted) {
    return undefined;
  }

  const matches = locations.filter((row) =>
    [row.name, row.code, row.title, row.short_name].some(
      (label) =>
        typeof label === 'string' && normalizeDistrict(label) === wanted,
    ),
  );

  return matches.length === 1 ? matches[0].id : undefined;
};
