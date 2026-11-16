import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Id } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

// What the field and field group procedures share.

export const int = () => z.int();

export const code = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9_.-]+$/, 'letters, digits, _ . -');

export const description = () => z.string().trim().max(1000);
export const label = () => z.string().trim().min(1).max(100);
export const order = () => z.int().min(0).max(100_000);

export const Orders = z.object({
  orders: z
    .array(z.object({ id: Id, order: z.int().min(0).max(100_000) }))
    .min(1)
    .max(500),
});

export const Ok = z.object({ ok: z.literal(true) });

export const changes = (value: Record<string, unknown>) =>
  Object.keys(value).some((key) => key !== 'id');

const { FIELD_IN_USE, INVALID_FIELD_GROUP, PLUGIN_FIELD, PLUGIN_NOT_INSTALLED } = ERRORS;

/** What these procedures answer with besides the common errors. */
export const base = oc.errors({
  ...COMMON_ERRORS,
  FIELD_IN_USE,
  INVALID_FIELD_GROUP,
  PLUGIN_FIELD,
  PLUGIN_NOT_INSTALLED,
});
