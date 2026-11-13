import { z } from 'zod';

export const Id = z.string().min(1).max(64);

/**
 * Keyset ("cursor") paging, newest first. A cursor is the id of a record in
 * the list: `forward` returns older records after it, `backward` newer ones
 * before it. `inclusive` also returns the cursor record itself, which lets a
 * list reopen where the user left it.
 */
export const CursorQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).prefault(30),
  cursor: Id.optional(),
  direction: z.enum(['forward', 'backward']).default('forward'),
  cursorMode: z.enum(['inclusive', 'exclusive']).default('exclusive'),
});

export type CursorQuery = z.infer<typeof CursorQuery>;

export const PageInfo = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

export type PageInfo = z.infer<typeof PageInfo>;

/** `true`/`false` from a query string, or a boolean from a typed client. */
export const QueryBoolean = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value) => value === 'true'),
]);

/** Comma-separated ids in a query string (`?ids=a,b`), at most 100. */
export const IdList = z
  .string()
  .max(6500)
  .transform((value) =>
    value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 100),
  );

/**
 * Every error (oRPC's error body): a stable `code` to branch on, the HTTP
 * `status`, a readable `message` and, for some codes, `data` (e.g. the id of
 * an existing record for `CUSTOMER_EXISTS`, validation `issues` for `INVALID_INPUT`).
 */
export const ErrorBody = z.object({
  defined: z.boolean(),
  code: z.string(),
  status: z.int(),
  message: z.string(),
  data: z.unknown().optional(),
});

export type ErrorBody = z.infer<typeof ErrorBody>;

export const cursorPageOf = <T extends z.ZodType>(item: T) =>
  z.object({
    data: z.array(item),
    pageInfo: PageInfo,
    /** Records matching the filters, across all pages. */
    totalCount: z.int(),
    /** Big lists stop counting: `totalCount` is the cap and there are more ("10,000+"). */
    totalCapped: z.boolean().optional(),
  });

/** Records that tags and custom fields attach to. */
export const ContentType = z.enum(['customer', 'company']);

export type ContentType = z.infer<typeof ContentType>;

/** Records custom fields attach to: contacts, and the shared product catalog. */
export const FieldContentType = z.enum([...ContentType.options, 'product']);

export type FieldContentType = z.infer<typeof FieldContentType>;

/** A custom field value: text, number, date (`YYYY-MM-DD`), yes/no or several options. */
export const CustomValue = z.union([
  z.string().max(5000),
  z.number(),
  z.boolean(),
  z.array(z.string().max(200)).max(50),
]);

export type CustomValue = z.infer<typeof CustomValue>;

/** Custom field values by field id. */
export const CustomFields = z.record(Id, CustomValue);

/** Changes to custom field values; `null` clears one. */
export const CustomFieldsPatch = z.record(Id, CustomValue.nullable());

export const EmailAddress = z.string().trim().toLowerCase().pipe(z.email().max(254));

export const PhoneNumber = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^\+?[0-9 ()-]+$/, 'digits, spaces, brackets, dashes and a leading +');

/** Optional text input: trimmed, `null` clears it. */
export const text = (max: number) => z.string().trim().max(max).nullable().optional();

/**
 * A picture's address: a full `http(s)` URL, or a file in core's file service
 * (`/core/v1/files/<id>/download`, as uploads return).
 */
export const ImageAddress = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (value) =>
      /^https?:\/\/\S+$/.test(value) || /^\/core\/v1\/files\/[A-Za-z0-9]+\/download$/.test(value),
    'a URL or an uploaded file',
  );
