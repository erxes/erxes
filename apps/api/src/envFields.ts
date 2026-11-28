import { BOOLEAN_STRINGS } from '@erxes/core-db/enums';
import { z } from 'zod';

/** The kinds of value `env.ts` reads. Blank counts as unset; values are trimmed. */
export const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || undefined : value),
    schema.optional(),
  );

export const text = optional(z.string());

export const flag = optional(z.enum(BOOLEAN_STRINGS).transform((value) => value === 'true'));

export const positive = (fallback: number) =>
  optional(z.coerce.number().positive()).transform((value) => value ?? fallback);

export const baseUrl = (fallback: string) =>
  optional(z.url())
    .transform((value) => value ?? fallback)
    .transform((value) => value.replace(/\/+$/, ''));

export const overrideUrl = optional(z.url()).transform((value) => value?.replace(/\/+$/, ''));

export const list = optional(z.string()).transform((value) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
);
