/**
 * Lenient readers for what old erxes stored in Mongo. A field of the wrong type reads as missing
 * rather than refusing the document; only an `_id` that is neither text nor an ObjectId refuses
 * it. Shapes follow erxes 3.4 (`old-src/backend`).
 */
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const mongoId = z.union([
  z.string().trim().min(1),
  z.instanceof(ObjectId).transform((value) => value.toHexString()),
]);

/** A document with Mongo's `_id` key named `id`. */
const renameId = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).map(([key, inner]) => [key === '_id' ? 'id' : key, inner]),
      )
    : value;

const IdOnly = z.preprocess(renameId, z.object({ id: mongoId }));

/** A Mongo document's schema; its `_id` reads as `id`. */
export const record = <T extends Record<string, z.ZodType>>(fields: T) =>
  z.preprocess(renameId, z.object({ id: mongoId }).extend(fields));

/** A raw document's id as text, for the report. */
export const idOf = (document: unknown) => {
  const parsed = IdOnly.safeParse(document);

  return parsed.success ? parsed.data.id : '?';
};

/** A field read by `read`, whatever it holds, missing included. */
export const field = <T>(read: (value: unknown) => T) => z.unknown().optional().transform(read);

/** Text, or null when missing or blank; numbers in text fields become text. */
export const text = field((value) =>
  typeof value === 'string' || typeof value === 'number' ? String(value).trim() || null : null,
);

/** Trimmed, non-empty, unique texts. */
export const texts = field((value) =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.flatMap((item) => (typeof item === 'string' && item.trim() ? [item.trim()] : [])),
        ),
      ]
    : [],
);

const idOrNull = (value: unknown) => {
  const parsed = mongoId.safeParse(value);

  return parsed.success ? parsed.data : null;
};

export const ids = field((value) =>
  Array.isArray(value) ? [...new Set(value.flatMap((item) => idOrNull(item) ?? []))] : [],
);

export const optionalId = field(idOrNull);

const toDate = (value: unknown) => {
  if (!(value instanceof Date || typeof value === 'string' || typeof value === 'number')) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const when = field(toDate);

/** A calendar day, `YYYY-MM-DD`, for years Postgres and people agree on. */
export const day = field((value) => {
  const date = toDate(value);
  const year = date?.getUTCFullYear() ?? 0;

  return date && year > 1900 && year < 2100 ? date.toISOString().slice(0, 10) : null;
});

export const flag = field((value) => (typeof value === 'boolean' ? value : null));

export const amount = field((value) => {
  const number = typeof value === 'string' && value.trim() ? Number(value) : value;

  return typeof number === 'number' && Number.isFinite(number) ? number : null;
});

/** Any value, made plain for jsonb: ObjectIds as hex, Dates as ISO text. */
export const plain = (value: unknown): unknown => {
  if (value instanceof ObjectId) return value.toHexString();

  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();

  if (Array.isArray(value)) return value.map(plain);

  if (value === null || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, plain(inner)]));
};

/** Named links (`{ facebook: 'https://…' }`), only those that are text. */
export const links = field((value) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).flatMap(([name, link]) =>
          typeof link === 'string' && link.trim() ? [[name, link.trim()]] : [],
        ),
      )
    : {},
);

/** An amount in the currency's smallest unit (MNT ×100), rounded. */
export const minor = (value: number | null) => (value === null ? null : Math.round(value * 100));

/** When an ObjectId was made, for documents with no `createdAt`. */
const idTime = (id: string) =>
  /^[0-9a-f]{24}$/i.test(id) ? new Date(Number.parseInt(id.slice(0, 8), 16) * 1000) : null;

/** When the import started: the last resort for a record that has no time at all. */
const IMPORTED_AT = new Date();

/** `createdAt`, else the ObjectId's time, else the first of `fallbacks`, else the import's time. */
export const createdOf = (id: string, createdAt: Date | null, ...fallbacks: (Date | null)[]) =>
  createdAt ?? idTime(id) ?? fallbacks.find((date) => date !== null) ?? IMPORTED_AT;

/** Lower-case trimmed email, or null when it has no `@`. */
export const email = (value: string | null) => {
  const lower = value?.trim().toLowerCase() ?? '';

  return lower.includes('@') ? lower : null;
};

/** Reads `value` with `schema`, or null when it doesn't fit. */
export const readOr = <T>(schema: z.ZodType<T>, value: unknown): T | null => {
  const parsed = schema.safeParse(value);

  return parsed.success ? parsed.data : null;
};
