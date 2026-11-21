import {
  DATA_EXTENSION_FIELD_TYPES,
  DATA_EXTENSION_ON_DELETE,
  DATA_EXTENSION_OPTION_COLORS,
  DATA_EXTENSION_RELATION_KINDS,
  DATA_EXTENSION_RELATION_SIDES,
  DATA_EXTENSION_RESULT_TYPES,
  DATA_EXTENSION_ROLLUP_OPS,
  DATA_EXTENSION_STATUSES,
  DATA_EXTENSION_VISIBLE_OPERATORS,
} from '@erxes/core-db/dataExtensionEnums';
import { z } from 'zod';
import { Id, isoDate } from './common';
import { RoleKey } from './values';

/**
 * Data Extensions: objects and fields an organisation defines at runtime, for its own records
 * (custom objects) and for core's and plugins' (`core.customer`, `hr.employee`). Core keeps
 * each organisation's in its own schema, a table per object and a column per field, as Twenty
 * does; web draws every screen from the definitions.
 */

/** The first half of a custom object's record type: `custom.project`. */
export const CUSTOM_OBJECT_PREFIX = 'custom';

export const DataExtensionFieldType = z.enum(DATA_EXTENSION_FIELD_TYPES);

export type DataExtensionFieldType = z.infer<typeof DataExtensionFieldType>;

export const DataExtensionOptionColor = z.enum(DATA_EXTENSION_OPTION_COLORS);

export const DataExtensionRelationKind = z.enum(DATA_EXTENSION_RELATION_KINDS);

export type DataExtensionRelationKind = z.infer<typeof DataExtensionRelationKind>;

export const DataExtensionStatus = z.enum(DATA_EXTENSION_STATUSES);

/** A custom object's key: lower case and `_`, the second half of its record type. */
export const DataExtensionObjectKey = z
  .string()
  .regex(/^[a-z][a-z0-9_]{0,39}$/, 'lower case letters, digits and _, starting with a letter');

/** A field's key: camelCase, the name its value has in `values`. */
export const DataExtensionFieldKey = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]{0,29}$/, 'camelCase letters and digits, starting with a letter');

/** Core's (`core.customer`), a plugin's (`hr.employee`) or a custom object's (`custom.project`). */
export const DataExtensionRecordType = z
  .string()
  .regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/, '<plugin>.<type>');

/** A custom object's record type: `custom.<key>`. */
export const customObjectType = (key: string) => `${CUSTOM_OBJECT_PREFIX}.${key}`;

const Label = z.string().trim().min(1).max(120);
const Description = z.string().trim().max(500);

/** A Tabler icon name: `IconBriefcase`. */
const Icon = z
  .string()
  .regex(/^Icon[A-Za-z0-9]+$/, 'a Tabler icon name')
  .max(60);

/** One choice of a select or multi-select field. `value` is stored; `label` can change. */
export const DataExtensionOption = z.object({
  value: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[^,{}"\\]+$/, 'no commas, braces, quotes or backslashes'),
  label: Label,
  color: DataExtensionOptionColor.default('gray'),
});

export type DataExtensionOption = z.infer<typeof DataExtensionOption>;

/** A select's options, each value once. */
export const DataExtensionOptions = z
  .array(DataExtensionOption)
  .max(100)
  .refine(
    (options) => new Set(options.map((option) => option.value)).size === options.length,
    'each value once',
  );

/** A relation field: the record type it links to, and the field paired with it there. */
export const DataExtensionRelation = z.object({
  targetRecordType: DataExtensionRecordType,
  kind: DataExtensionRelationKind,
  side: z.enum(DATA_EXTENSION_RELATION_SIDES),
  /** The paired field on the target record type. */
  inverseFieldId: Id,
  /** For links to custom records: what deleting the linked record does to this one. */
  onDelete: z.enum(DATA_EXTENSION_ON_DELETE),
});

export type DataExtensionRelation = z.infer<typeof DataExtensionRelation>;

/** Roles by key (`admin`, `r_…`), each once. */
const RoleKeys = z
  .array(RoleKey)
  .max(50)
  .refine((list) => new Set(list).size === list.length, 'each role once');

/** Shown on a form only while another field's value matches. */
const VisibleWhen = z.object({
  field: DataExtensionFieldKey,
  operator: z.enum(DATA_EXTENSION_VISIBLE_OPERATORS),
  value: z.json().optional(),
});

export const DataExtensionResultType = z.enum(DATA_EXTENSION_RESULT_TYPES);

export type DataExtensionResultType = z.infer<typeof DataExtensionResultType>;

/** A formula's text: `{amount} * 1.1`, `IF({stage} == "won", {amount}, 0)`. */
export const DataExtensionExpression = z.string().trim().min(1).max(1000);

/** A field a formula or rollup names: a field's key, or a record type's own field (`closed_at`). */
const FieldName = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9_]{0,59}$/, 'a field key, or a record type’s own field');

/**
 * A formula field. `{key}` reads a field of the record (its own, a plugin's or core's, or
 * another computed one); `{relation.key}` reads through a relation to one record. `result` is
 * what the API found the formula gives; it ignores what a write sends.
 */
export const DataExtensionFormula = z.object({
  expression: DataExtensionExpression,
  result: DataExtensionResultType.optional(),
});

/**
 * A rollup field: sums up the records `relation` links (`count`, or `sum` of their `field`),
 * only those `where` (a formula over them) is true of.
 */
export const DataExtensionRollup = z.object({
  relation: DataExtensionFieldKey,
  op: z.enum(DATA_EXTENSION_ROLLUP_OPS),
  field: FieldName.optional(),
  where: DataExtensionExpression.optional(),
  result: DataExtensionResultType.optional(),
});

/** How a field behaves. The API checks every setting on each write, so no client skips one. */
export const DataExtensionFieldSettings = z.object({
  /** A value can't be cleared once set, and create forms ask for it. */
  required: z.boolean().optional(),
  /** No two records share a value (text, email, phone, url, number). */
  unique: z.boolean().optional(),
  /** Filled in on create forms; checked like any value. */
  defaultValue: z.json().optional(),
  /** Bounds of a number, percent or currency amount. */
  min: z.number().optional(),
  max: z.number().optional(),
  /** Longest text, below the type's own limit. */
  maxLength: z.int().min(1).max(20_000).optional(),
  /** Stars of a rating, 3 to 10. */
  scale: z.int().min(3).max(10).optional(),
  /** The currency a currency field offers first (ISO 4217). */
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  /** Decimals a number or percent shows. */
  precision: z.int().min(0).max(6).optional(),
  /** Member fields: several team members instead of one. */
  multiple: z.boolean().optional(),
  /** The section the field shows under on a record. */
  group: z.string().trim().max(60).optional(),
  /** Asked on create forms; on unless false. */
  showInCreate: z.boolean().optional(),
  placeholder: z.string().trim().max(120).optional(),
  /** Only members who manage the data model may change the value. */
  readOnly: z.boolean().optional(),
  visibleWhen: VisibleWhen.optional(),
  /** Required while another field's value matches: `stage` is `lost` → a lost reason. */
  requiredWhen: VisibleWhen.optional(),
  /** The roles (keys) that see the field's values; empty or absent: everyone. */
  visibleTo: RoleKeys.optional(),
  /** The roles that change its values, among those that see them; empty or absent: everyone. */
  editableBy: RoleKeys.optional(),
  formula: DataExtensionFormula.optional(),
  rollup: DataExtensionRollup.optional(),
  /** An auto number's text before the number: `PRJ-` gives PRJ-0042. */
  prefix: z
    .string()
    .trim()
    .max(12)
    .regex(/^[^{}"\\]*$/, 'no braces, quotes or backslashes')
    .optional(),
  /** Digits an auto number pads to with zeros. */
  digits: z.int().min(1).max(10).optional(),
});

export type DataExtensionFieldSettings = z.infer<typeof DataExtensionFieldSettings>;

/** A field of a record type. */
export const DataExtensionField = z.object({
  id: Id,
  recordType: DataExtensionRecordType,
  key: DataExtensionFieldKey,
  label: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  type: DataExtensionFieldType,
  /** A select's choices, in order; empty for other types. */
  options: z.array(DataExtensionOption),
  relation: DataExtensionRelation.nullable(),
  settings: DataExtensionFieldSettings,
  /** Order on records and forms, lowest first. */
  position: z.int(),
  status: DataExtensionStatus,
  createdAt: isoDate(),
  updatedAt: isoDate(),
});

export type DataExtensionField = z.infer<typeof DataExtensionField>;

/** A new field. A relation is added with `relations.create`, which adds both sides. */
export const DataExtensionFieldCreate = z.object({
  recordType: DataExtensionRecordType,
  key: DataExtensionFieldKey,
  label: Label,
  description: Description.optional(),
  icon: Icon.optional(),
  type: DataExtensionFieldType.exclude(['relation']),
  options: DataExtensionOptions.optional(),
  settings: DataExtensionFieldSettings.optional(),
});

/**
 * A field's changes. A new key renames its column; a new type only between text and long text,
 * or number and percent. Options are replaced as a whole: a dropped value is cleared on records.
 */
export const DataExtensionFieldUpdate = z.object({
  id: Id,
  key: DataExtensionFieldKey.optional(),
  label: Label.optional(),
  description: Description.nullable().optional(),
  icon: Icon.nullable().optional(),
  type: DataExtensionFieldType.exclude(['relation']).optional(),
  options: DataExtensionOptions.optional(),
  settings: DataExtensionFieldSettings.optional(),
});

/** A relation: a field on `recordType` and its pair on `targetRecordType`, added together. */
export const DataExtensionRelationCreate = z.object({
  recordType: DataExtensionRecordType,
  key: DataExtensionFieldKey,
  label: Label,
  targetRecordType: DataExtensionRecordType,
  kind: DataExtensionRelationKind,
  inverseKey: DataExtensionFieldKey,
  inverseLabel: Label,
  onDelete: z.enum(DATA_EXTENSION_ON_DELETE).default('setNull'),
});

/** A custom object: a record type of the organisation's own, kept in its own table. */
export const DataExtensionObject = z.object({
  id: Id,
  key: DataExtensionObjectKey,
  /** `custom.<key>`: what fields, relations and views name it by. */
  recordType: DataExtensionRecordType,
  singularLabel: z.string(),
  pluralLabel: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  /** The text field that names a record (its title in lists and pickers). */
  labelFieldId: Id.nullable(),
  status: DataExtensionStatus,
  createdAt: isoDate(),
  updatedAt: isoDate(),
});

export type DataExtensionObject = z.infer<typeof DataExtensionObject>;

/** A new object. It starts with a `name` text field, its label field. */
export const DataExtensionObjectCreate = z.object({
  key: DataExtensionObjectKey,
  singularLabel: Label,
  pluralLabel: Label,
  description: Description.optional(),
  icon: Icon.optional(),
});

/** An object's changes. Its key, and so its table, never change. */
export const DataExtensionObjectUpdate = z.object({
  key: DataExtensionObjectKey,
  singularLabel: Label.optional(),
  pluralLabel: Label.optional(),
  description: Description.nullable().optional(),
  icon: Icon.nullable().optional(),
  labelFieldId: Id.optional(),
});
