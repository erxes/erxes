import { z } from 'zod';

type Path = readonly (string | number)[];

const READERS = {
  text: z.string().min(1),
  number: z.number(),
  boolean: z.boolean(),
  date: z.number().transform((seconds) => new Date(seconds * 1000).toISOString()),
  list: z
    .array(z.string())
    .min(1)
    .transform((items) => items.join(', ')),
  lines: z
    .record(z.string(), z.string())
    .transform((entries) =>
      Object.entries(entries)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n'),
    )
    .pipe(z.string().min(1)),
};

type Read = keyof typeof READERS;

const OUTPUT_TYPE = {
  text: 'text',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  list: 'text',
  lines: 'text',
} as const;

export interface StripeField {
  key: string;
  label: string;
  read: Read;
  from: readonly Path[];
  /** The value is the id of one of Stripe's records, which the builder's pickers offer. */
  recordType?: string;
}

export const lifted = (key: string, label: string, read: Read, ...from: Path[]): StripeField => ({
  key,
  label,
  read,
  from,
});

export const own = (key: string, label: string, read: Read = 'text') =>
  lifted(key, label, read, [key]);

const List = z.array(z.unknown());

const Fields = z.record(z.string(), z.unknown());

const step = (value: unknown, key: string | number) =>
  typeof key === 'number' ? List.safeParse(value).data?.[key] : Fields.safeParse(value).data?.[key];

const valueOf = (field: StripeField, root: unknown) => {
  for (const path of field.from) {
    const read = READERS[field.read].safeParse(path.reduce((value, key) => step(value, key), root));

    if (read.success) return read.data;
  }

  return undefined;
};

export const rowOf = (fields: readonly StripeField[], root: unknown) =>
  Object.fromEntries(
    fields.flatMap((field) => {
      const value = valueOf(field, root);

      return value === undefined ? [] : [[field.key, value]];
    }),
  );

const Scalar = z.union([z.string(), z.number(), z.boolean()]);

export const scalarsOf = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => Scalar.safeParse(value).success));

export const outputsOf = (fields: readonly StripeField[]) =>
  fields.map(({ key, label, read, recordType }) => ({
    key,
    label,
    type: OUTPUT_TYPE[read],
    ...(recordType && { recordType }),
  }));

/** The id of a Stripe customer, under `key`. */
export const customerId = (key: string): StripeField => ({
  ...own(key, 'Customer id'),
  recordType: 'customer',
});

const phrase = (label: string, name: string) =>
  label ? `${label} ${name}` : name.charAt(0).toUpperCase() + name.slice(1);

const ADDRESS = [
  ['city', 'City', 'city'],
  ['country', 'Country', 'country'],
  ['line1', 'Line1', 'address line 1'],
  ['line2', 'Line2', 'address line 2'],
  ['postal_code', 'PostalCode', 'postal code'],
  ['state', 'State', 'state or region'],
] as const;

export const addressFields = (prefix: string, label: string, path: Path) =>
  ADDRESS.map(([from, suffix, name]) =>
    lifted(`${prefix}${suffix}`, phrase(label, name), 'text', [...path, from]),
  );

export const recipientFields = (prefix: string, label: string, path: Path) => [
  lifted(`${prefix}Name`, phrase(label, 'name'), 'text', [...path, 'name']),
  lifted(`${prefix}Phone`, phrase(label, 'phone'), 'text', [...path, 'phone']),
  ...addressFields(prefix, label, [...path, 'address']),
];

export const contactFields = (prefix: string, label: string, path: Path) => [
  lifted(`${prefix}Email`, phrase(label, 'email'), 'text', [...path, 'email']),
  ...recipientFields(prefix, label, path),
];

const CARD = [
  ['brand', 'Brand', 'brand', 'text'],
  ['last4', 'Last4', 'last 4 digits', 'text'],
  ['country', 'Country', 'country', 'text'],
  ['exp_month', 'ExpMonth', 'expiry month', 'number'],
  ['exp_year', 'ExpYear', 'expiry year', 'number'],
  ['funding', 'Funding', 'funding (credit or debit)', 'text'],
] as const;

export const cardFields = (...paths: Path[]) =>
  CARD.map(([from, suffix, name, read]) =>
    lifted(`card${suffix}`, phrase('Card', name), read, ...paths.map((path) => [...path, from])),
  );

const OUTCOME = [
  ['type', 'outcomeType', 'Outcome', 'text'],
  ['network_status', 'outcomeNetworkStatus', 'Card network answer', 'text'],
  ['reason', 'outcomeReason', 'Outcome reason', 'text'],
  ['seller_message', 'outcomeMessage', 'Outcome message', 'text'],
  ['risk_level', 'riskLevel', 'Risk level', 'text'],
  ['risk_score', 'riskScore', 'Risk score', 'number'],
] as const;

export const outcomeFields = (path: Path) =>
  OUTCOME.map(([from, key, label, read]) => lifted(key, label, read, [...path, from]));

export const COMMON = [
  own('livemode', 'Live mode', 'boolean'),
  own('metadata', 'Metadata (key: value lines)', 'lines'),
];

export const EVENT = [
  lifted('stripeEventId', 'Stripe event id', 'text', ['id']),
  lifted('stripeEventType', 'Stripe event type', 'text', ['type']),
  lifted('stripeEventAt', 'Event time', 'date', ['created']),
];
