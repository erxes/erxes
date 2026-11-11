import { z } from 'zod';

const text = z.string().nullish();
const numeric = z.union([z.number(), z.string()]).nullish();
const idValue = z.union([z.string(), z.number()]).transform(String);

export const PAPA_SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'BIG'] as const;
export type TPapaSize = (typeof PAPA_SIZES)[number];

export const PAPA_CAR_TYPE_GROUPS = ['car', 'light'] as const;
export type TPapaCarTypeGroup = (typeof PAPA_CAR_TYPE_GROUPS)[number];

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
    addressId: text,
    carTypeGroups: z.array(z.enum(PAPA_CAR_TYPE_GROUPS)).nullish(),
    categoryId: text,
    conditionId: text,
    size: z.enum(PAPA_SIZES).nullish(),
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
    sentAt: text,
    updatedAt: text,
  })
  .passthrough();

export type TPapaDelivery = z.infer<typeof papaDeliverySchema>;

// Papa reference rows (`app/init`); Papa does not document their exact shape,
// so only an id and a display name are required.
const referenceRowSchema = z
  .object({
    id: idValue,
    name: text,
    title: text,
    code: text,
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
      return parsed.success ? [parsed.data] : [];
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

export const parsePapaDelivery = (value: unknown): TPapaDelivery | null => {
  const parsed = papaDeliverySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
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

/** Reads the delivery address erxes captured on the order, when present. */
export const orderDeliveryDefaults = (deliveryInfo: unknown) => {
  const parsed = z
    .object({
      address: text,
      phone: text,
      description: text,
      marker: z
        .object({
          lat: numeric,
          lng: numeric,
          latitude: numeric,
          longitude: numeric,
        })
        .passthrough()
        .nullish(),
    })
    .passthrough()
    .safeParse(deliveryInfo ?? {});

  if (!parsed.success) {
    return { address: '', phone: '', description: '', lat: '', lng: '' };
  }

  const { address, phone, description, marker } = parsed.data;

  return {
    address: address || '',
    phone: phone || '',
    description: description || '',
    lat: String(marker?.latitude ?? marker?.lat ?? ''),
    lng: String(marker?.longitude ?? marker?.lng ?? ''),
  };
};
