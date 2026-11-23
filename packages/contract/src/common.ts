import {
  BOOLEAN_STRINGS,
  CONTENT_TYPES,
  CURSOR_MODES,
  FIELD_CONTENT_TYPES,
  PAGE_DIRECTIONS,
} from '@erxes/core-db/enums';
import { z } from 'zod';

export const Id = z.string().min(1).max(64);

/**
 * A timestamp column in an output schema: the handler returns the row's `Date`,
 * the client gets an ISO string. Give it to `createSelectSchema` as a
 * refinement (`{ createdAt: isoDate }`), so a nullable column stays nullable.
 * Inputs and JSON bodies read from the wire take `z.iso.datetime()`.
 */
export const isoDate = () =>
  z.codec(z.date(), z.iso.datetime(), {
    decode: (date) => date.toISOString(),
    encode: (iso) => new Date(iso),
  });

/**
 * Keyset ("cursor") paging, newest first. A cursor is the id of a record in
 * the list: `forward` returns older records after it, `backward` newer ones
 * before it. `inclusive` also returns the cursor record itself, which lets a
 * list reopen where the user left it.
 */
export const CursorQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  cursor: Id.optional(),
  direction: z.enum(PAGE_DIRECTIONS).default('forward'),
  cursorMode: z.enum(CURSOR_MODES).default('exclusive'),
});

export type CursorQuery = z.infer<typeof CursorQuery>;

export const PageInfo = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

export type PageInfo = z.infer<typeof PageInfo>;

/** `true`/`false` from a query string. */
export const QueryFlag = z.enum(BOOLEAN_STRINGS).transform((value) => value === 'true');

/** `true`/`false` from a query string, or a boolean from a typed client. */
export const QueryBoolean = z.union([z.boolean(), QueryFlag]);

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

/** `INVALID_INPUT`'s `data`: what failed the contract, field by field. */
export const InvalidInput = z.object({
  issues: z.array(z.object({ path: z.array(z.union([z.string(), z.int()])), message: z.string() })),
});

/** Longest description a person, customer or company holds, as stored (editor JSON). */
export const DESCRIPTION_MAX = 5000;

export const cursorPageOf = <T extends z.ZodType>(item: T) =>
  z.object({
    data: z.array(item),
    pageInfo: PageInfo,
    /**
     * Records matching the filters, across all pages. Only on a list's first page (no
     * cursor, or reopening at one with `inclusive`): the pages after it don't count again.
     */
    totalCount: z.int().optional(),
    /** Big lists stop counting: `totalCount` is the cap and there are more ("10,000+"). */
    totalCapped: z.boolean().optional(),
  });

/** A page of `T`s, as a `cursorPageOf` list answers. */
export type CursorPage<T> = z.infer<ReturnType<typeof cursorPageOf<z.ZodType<T>>>>;

/**
 * Most items a list read whole may hold. Whole lists are small config
 * (roles, stages, fields, webhooks); past this the server fails instead of
 * cutting the list. Lists that grow with use are `cursorPageOf`.
 */
export const LIST_MAX = 1000;

/** A small config list, read whole: at most `LIST_MAX` items. */
export const listOf = <T extends z.ZodType>(item: T) =>
  z.object({ data: z.array(item).max(LIST_MAX) });

/** Records that tags and custom fields attach to. */
export const ContentType = z.enum(CONTENT_TYPES);

export type ContentType = z.infer<typeof ContentType>;

/** Records custom fields attach to: contacts, and the shared product catalog. */
export const FieldContentType = z.enum(FIELD_CONTENT_TYPES);

export type FieldContentType = z.infer<typeof FieldContentType>;

/** A name part of a plugin record type: lower case letters, digits and `_`. */
const recordTypePart = z.string().regex(/^[a-z][a-z0-9_]*$/);

/**
 * A plugin's own record type, `<plugin>.<type>` (`operation.task`): core keeps
 * its custom field definitions, the plugin keeps the values.
 */
export const PluginRecordType = z.templateLiteral([recordTypePart, '.', recordTypePart]);

export type PluginRecordType = z.infer<typeof PluginRecordType>;

/** What custom fields are defined for: one of core's records, or a plugin's record type. */
export const PropertyContentType = z.union([FieldContentType, PluginRecordType]);

export type PropertyContentType = z.infer<typeof PropertyContentType>;

/** One of core's records, whose custom field values core keeps (in `core_<type>_field_values`). */
export const isCoreFieldType = (type: PropertyContentType): type is FieldContentType =>
  FieldContentType.safeParse(type).success;

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

/**
 * Ids by what a plugin's UI config names (`{ team: [id], project: [id] }`): the records of its
 * type a field group shows on, or the ones a record is in. At most 5 keys of 200 ids.
 */
export const AppliesTo = z
  .record(z.string().regex(/^[a-z][a-z0-9_]{0,29}$/), z.array(Id).max(200))
  .refine((value) => Object.keys(value).length <= 5, 'at most 5 keys');

export type AppliesTo = z.infer<typeof AppliesTo>;

/** Whether a group shows on a record: the record is in one of the ids of each key the group lists. */
export const groupApplies = (group: AppliesTo, record: AppliesTo) =>
  Object.entries(group).every(
    ([key, ids]) => !ids.length || ids.some((id) => record[key]?.includes(id)),
  );

export const EmailAddress = z.string().trim().toLowerCase().check(z.email()).max(254);

export const PhoneNumber = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^\+?[0-9 ()-]+$/, 'digits, spaces, brackets, dashes and a leading +');

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

export const httpUrl = (max: number) =>
  z
    .string()
    .trim()
    .check(z.url())
    .max(max)
    .refine((value) => /^https?:\/\//.test(value), 'an http(s) address');
