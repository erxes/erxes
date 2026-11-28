import { z } from 'zod';
import { type AppAction, Text } from '@erxes/plugin-sdk/integrations';
import type { StripeClient } from './server';

export type StripeField = AppAction<StripeClient>['fields'][number];

export const words = (max: number) => Text.pipe(z.string().trim().min(1).max(max));

export const stripeId = (prefix: string) =>
  words(255).pipe(z.string().regex(new RegExp(`^${prefix}_\\w+$`), `a Stripe id (${prefix}_…)`));

export const Amount = z.coerce.number().int().min(1).max(99_999_999);

export const Currency = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, 'a 3-letter currency code')
  .transform((code) => code.toLowerCase());

export const Metadata = z
  .record(z.string().trim().min(1).max(40), Text.pipe(z.string().max(500)))
  .refine((metadata) => Object.keys(metadata).length <= 50, 'at most 50 keys');

export const SMALLEST_UNIT = 'In the smallest unit: $12.50 is 1250';

export const CURRENCY_FIELD: StripeField = {
  key: 'currency',
  label: 'Currency',
  type: 'text',
  required: true,
  placeholder: 'usd',
  description: 'Its 3-letter code',
};

export const METADATA_FIELD: StripeField = {
  key: 'metadata',
  label: 'Metadata',
  type: 'key_values',
  required: false,
  description: 'Your own keys and values, kept on the Stripe record',
};

export const CUSTOMER_FIELD: StripeField = {
  key: 'customer',
  label: 'Stripe customer',
  type: 'plugin_record',
  recordType: 'customer',
  required: true,
};

/** A select's choices, from the labels of each value. */
export const optionsOf = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

/** Stripe's form fields: blank values left out, metadata as `metadata[key]`. */
export const formOf = (
  fields: Record<string, string | number | undefined>,
  metadata: Record<string, string> = {},
) => {
  const filled = Object.entries(fields).flatMap(([key, value]): [string, string][] =>
    value === undefined || value === '' ? [] : [[key, String(value)]],
  );

  const kept = Object.entries(metadata).map(([key, value]): [string, string] => [
    `metadata[${key}]`,
    value,
  ]);

  return Object.fromEntries([...filled, ...kept]);
};

export const once = (idempotencyKey: string) => ({ 'Idempotency-Key': idempotencyKey });
