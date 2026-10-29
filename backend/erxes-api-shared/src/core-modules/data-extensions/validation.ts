import {
  DATA_EXTENSION_ADDRESS_PARTS,
  DATA_EXTENSION_FIELD_KEY_PATTERN,
  DATA_EXTENSION_FIELD_TYPES,
  DATA_EXTENSION_LENGTH_TYPES,
  DATA_EXTENSION_LIMITS,
  DATA_EXTENSION_OBJECT_ICONS,
  DATA_EXTENSION_OBJECT_KEY_PATTERN,
  DATA_EXTENSION_OPTION_COLORS,
  DATA_EXTENSION_RANGE_TYPES,
  DATA_EXTENSION_RELATION_CREATE_KINDS,
  DATA_EXTENSION_RELATION_KINDS,
  DATA_EXTENSION_RESERVED_KEYS,
  DATA_EXTENSION_UNIQUE_TYPES,
  DATA_EXTENSIONS_NAMESPACE,
} from './constants';
import { getDataExtensionRecordType } from './recordTypes';
import {
  DataExtensionFieldType,
  DataExtensionOptionColor,
  DataExtensionRelationKind,
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionFieldOption,
  IDataExtensionFieldSettings,
  IDataExtensionPatchUpdate,
} from './types';

export class DataExtensionValidationError extends Error {
  readonly isExpected = true;
  readonly code = 'BAD_USER_INPUT';

  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
    Object.setPrototypeOf(this, DataExtensionValidationError.prototype);
  }
}

const fail = (message: string): never => {
  throw new DataExtensionValidationError(message);
};

export interface IDataExtensionFieldCreateInput {
  recordType: string;
  key: string;
  label: string;
  description?: string | null;
  type: string;
  options?: IDataExtensionFieldOption[] | null;
  settings?: IDataExtensionFieldSettings | null;
  order?: number | null;
}

export interface IDataExtensionFieldEditInput {
  label?: string | null;
  description?: string | null;
  options?: IDataExtensionFieldOption[] | null;
  settings?: IDataExtensionFieldSettings | null;
  order?: number | null;
}

const isFieldType = (type: string): type is DataExtensionFieldType =>
  (DATA_EXTENSION_FIELD_TYPES as readonly string[]).includes(type);

const hasOptions = (type: DataExtensionFieldType) =>
  type === 'select' || type === 'multiSelect';

const cleanText = (
  value: unknown,
  name: string,
  maxLength: number,
  required: boolean,
): string | undefined => {
  if (value === undefined || value === null) {
    return required ? fail(`${name} is required`) : undefined;
  }

  if (typeof value !== 'string') {
    return fail(`${name} must be a string`);
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    return fail(`${name} is required`);
  }

  if (trimmed.length > maxLength) {
    return fail(`${name} must be at most ${maxLength} characters`);
  }

  return trimmed;
};

export const validateDataExtensionFieldKey = (key: unknown): string => {
  if (typeof key !== 'string' || !DATA_EXTENSION_FIELD_KEY_PATTERN.test(key)) {
    return fail(
      'Key must start with a lowercase letter and contain only letters and digits (max 63)',
    );
  }

  if ((DATA_EXTENSION_RESERVED_KEYS as readonly string[]).includes(key)) {
    return fail(`Key "${key}" is reserved`);
  }

  return key;
};

const normalizeOptions = (
  options: IDataExtensionFieldOption[] | null | undefined,
): IDataExtensionFieldOption[] => {
  if (!Array.isArray(options) || options.length === 0) {
    return fail('Select fields need at least one option');
  }

  if (options.length > DATA_EXTENSION_LIMITS.optionsPerField) {
    return fail(
      `A field can have at most ${DATA_EXTENSION_LIMITS.optionsPerField} options`,
    );
  }

  const seen = new Set<string>();

  return options.map((option) => {
    const value = cleanText(
      option?.value,
      'Option value',
      DATA_EXTENSION_LIMITS.optionValueLength,
      true,
    ) as string;
    const label =
      cleanText(
        option?.label,
        'Option label',
        DATA_EXTENSION_LIMITS.labelLength,
        false,
      ) || value;

    if (seen.has(value)) {
      fail(`Duplicate option value "${value}"`);
    }

    seen.add(value);

    const color = option?.color;

    if (color === undefined || color === null) {
      return { value, label };
    }

    if (
      !(DATA_EXTENSION_OPTION_COLORS as readonly string[]).includes(color)
    ) {
      fail(`Unknown option colour "${color}"`);
    }

    return { value, label, color: color as DataExtensionOptionColor };
  });
};

const normalizeOrder = (order: unknown): number | undefined => {
  if (order === undefined || order === null) {
    return undefined;
  }

  if (typeof order !== 'number' || !Number.isInteger(order) || order < 0) {
    return fail('Order must be a non-negative integer');
  }

  return order;
};

const includesType = (types: readonly string[], type: string) =>
  types.includes(type);

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

const SETTING_KEYS: (keyof IDataExtensionFieldSettings)[] = [
  'required',
  'unique',
  'defaultValue',
  'min',
  'max',
  'maxLength',
  'scale',
  'currency',
  'multiple',
  'precision',
  'group',
  'showInCreate',
  'placeholder',
];

const optionalBoolean = (value: unknown, name: string) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === 'boolean' ? value : fail(`${name} must be true or false`);
};

const optionalInteger = (
  value: unknown,
  name: string,
  min: number,
  max: number,
) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    return fail(`${name} must be a whole number from ${min} to ${max}`);
  }

  return value;
};

const optionalNumber = (value: unknown, name: string) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : fail(`${name} must be a number`);
};

const maxTextLength = (type: DataExtensionFieldType) =>
  type === 'longText'
    ? DATA_EXTENSION_LIMITS.longTextLength
    : DATA_EXTENSION_LIMITS.textLength;

/**
 * Checks a field's settings against its type. Settings that would change how
 * stored values are shaped (`unique`, `multiple`) are only accepted when the
 * field is created, before any value exists; `previous` holds the settings
 * of an existing field being edited.
 */
export const validateDataExtensionFieldSettings = (
  type: DataExtensionFieldType,
  raw: unknown,
  options: IDataExtensionFieldOption[] | undefined,
  previous?: IDataExtensionFieldSettings,
): IDataExtensionFieldSettings | undefined => {
  if (raw === undefined || raw === null) {
    return previous;
  }

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return fail('Settings must be an object');
  }

  const input = raw as Record<string, unknown>;

  for (const key of Object.keys(input)) {
    if (!(SETTING_KEYS as string[]).includes(key)) {
      fail(`Unknown setting "${key}"`);
    }
  }

  if (type === 'relation') {
    return fail('Relations take no settings');
  }

  const settings: IDataExtensionFieldSettings = {};
  const isEdit = previous !== undefined;

  settings.required = optionalBoolean(input.required, 'Required');

  const unique = optionalBoolean(input.unique, 'Unique');

  if (unique) {
    if (!includesType(DATA_EXTENSION_UNIQUE_TYPES, type)) {
      fail('Only text, email, phone, URL and number fields can be unique');
    }

    if (isEdit && !previous?.unique) {
      fail('A field can only be made unique when it is created');
    }
  }

  settings.unique = unique === undefined && isEdit ? previous?.unique : unique;

  const multiple = optionalBoolean(input.multiple, 'Multiple');

  if (multiple !== undefined) {
    if (type !== 'member') {
      fail('Only member fields take "multiple"');
    }

    if (isEdit && Boolean(previous?.multiple) !== multiple) {
      fail('One or several members is fixed once the field is created');
    }
  }

  settings.multiple = isEdit ? previous?.multiple : multiple;

  const min = optionalNumber(input.min, 'Minimum');
  const max = optionalNumber(input.max, 'Maximum');

  if (
    (min !== undefined || max !== undefined) &&
    !includesType(DATA_EXTENSION_RANGE_TYPES, type)
  ) {
    fail('Only number, currency and percent fields take a minimum or maximum');
  }

  if (min !== undefined && max !== undefined && min > max) {
    fail('Minimum must not be above maximum');
  }

  settings.min = min;
  settings.max = max;

  const maxLength = optionalInteger(
    input.maxLength,
    'Maximum length',
    1,
    maxTextLength(type),
  );

  if (
    maxLength !== undefined &&
    !includesType(DATA_EXTENSION_LENGTH_TYPES, type)
  ) {
    fail('Only text fields take a maximum length');
  }

  settings.maxLength = maxLength;

  const scale = optionalInteger(
    input.scale,
    'Rating scale',
    3,
    DATA_EXTENSION_LIMITS.ratingMax,
  );

  if (scale !== undefined && type !== 'rating') {
    fail('Only rating fields take a scale');
  }

  settings.scale = scale;

  if (input.currency !== undefined && input.currency !== null) {
    if (type !== 'currency') {
      fail('Only currency fields take a currency');
    }

    if (
      typeof input.currency !== 'string' ||
      !CURRENCY_CODE_PATTERN.test(input.currency)
    ) {
      fail('Currency must be a 3-letter ISO 4217 code, e.g. MNT or USD');
    }

    settings.currency = input.currency as string;
  }

  const precision = optionalInteger(input.precision, 'Decimals', 0, 6);

  if (
    precision !== undefined &&
    !['number', 'percent', 'currency'].includes(type)
  ) {
    fail('Only number, currency and percent fields take decimals');
  }

  settings.precision = precision;
  settings.showInCreate = optionalBoolean(input.showInCreate, 'Show on create');
  settings.group =
    cleanText(input.group, 'Group', DATA_EXTENSION_LIMITS.groupLength, false) ||
    undefined;
  settings.placeholder =
    cleanText(
      input.placeholder,
      'Placeholder',
      DATA_EXTENSION_LIMITS.placeholderLength,
      false,
    ) || undefined;

  if (input.defaultValue !== undefined && input.defaultValue !== null) {
    if (['member', 'files', 'json'].includes(type)) {
      fail('This field type takes no default value');
    }

    // The default is checked exactly like a value a user would save.
    const draft = {
      key: 'defaultValue',
      type,
      options,
      settings,
    } as IDataExtensionField;
    const value = normalizeDataExtensionValue(draft, input.defaultValue);

    settings.defaultValue = value instanceof Date ? value.toISOString() : value;
  }

  for (const key of Object.keys(settings) as (keyof IDataExtensionFieldSettings)[]) {
    if (settings[key] === undefined) {
      delete settings[key];
    }
  }

  return Object.keys(settings).length ? settings : undefined;
};

export const validateDataExtensionFieldCreate = (
  input: IDataExtensionFieldCreateInput,
): Omit<IDataExtensionField, 'status' | 'createdBy' | 'updatedBy'> => {
  if (!getDataExtensionRecordType(input.recordType)) {
    fail(`Unsupported record type "${input.recordType}"`);
  }

  if (!isFieldType(input.type)) {
    return fail(`Unsupported field type "${input.type}"`);
  }

  if (input.type === 'relation') {
    return fail('Create relations with both sides through the relation API');
  }

  const type = input.type;
  const field: Omit<IDataExtensionField, 'status' | 'createdBy' | 'updatedBy'> =
    {
      recordType: input.recordType,
      key: validateDataExtensionFieldKey(input.key),
      label: cleanText(
        input.label,
        'Label',
        DATA_EXTENSION_LIMITS.labelLength,
        true,
      ) as string,
      description: cleanText(
        input.description,
        'Description',
        DATA_EXTENSION_LIMITS.descriptionLength,
        false,
      ),
      type,
      order: normalizeOrder(input.order) ?? 0,
    };

  if (hasOptions(type)) {
    field.options = normalizeOptions(input.options);
  } else if (input.options?.length) {
    fail('Only select fields take options');
  }

  const settings = validateDataExtensionFieldSettings(
    type,
    input.settings,
    field.options,
  );

  if (settings) {
    field.settings = settings;
  }

  return field;
};

export interface IDataExtensionRelationCreateInput {
  recordType: string;
  key: string;
  label: string;
  description?: string | null;
  targetRecordType: string;
  kind: string;
  inverseKey: string;
  inverseLabel: string;
  inverseDescription?: string | null;
}

type RelationFieldDraft = Omit<
  IDataExtensionField,
  'status' | 'createdBy' | 'updatedBy'
>;

const isRelationKind = (kind: string): kind is DataExtensionRelationKind =>
  (DATA_EXTENSION_RELATION_KINDS as readonly string[]).includes(kind);

/**
 * A relation is created as two paired fields, as in Twenty: the source
 * stores the link on its own records and the inverse is a virtual field on
 * the target record type. "Has many" is the same pair seen from the other
 * end, so it is stored as belongs-to started from the target; the field the
 * user named is then the inverse side, which can still be edited.
 */
export const validateDataExtensionRelationCreate = (
  rawInput: IDataExtensionRelationCreateInput,
): { source: RelationFieldDraft; inverse: RelationFieldDraft } => {
  if (
    !(DATA_EXTENSION_RELATION_CREATE_KINDS as readonly string[]).includes(
      rawInput.kind,
    )
  ) {
    return fail(`Unsupported relation kind "${rawInput.kind}"`);
  }

  const input: IDataExtensionRelationCreateInput =
    rawInput.kind === 'oneToMany'
      ? {
          recordType: rawInput.targetRecordType,
          key: rawInput.inverseKey,
          label: rawInput.inverseLabel,
          targetRecordType: rawInput.recordType,
          kind: 'manyToOne',
          inverseKey: rawInput.key,
          inverseLabel: rawInput.label,
          inverseDescription: rawInput.description,
        }
      : rawInput;

  if (!getDataExtensionRecordType(input.recordType)) {
    fail(`Unsupported record type "${input.recordType}"`);
  }

  if (!getDataExtensionRecordType(input.targetRecordType)) {
    fail(`Unsupported target record type "${input.targetRecordType}"`);
  }

  if (!isRelationKind(input.kind)) {
    return fail(`Unsupported relation kind "${input.kind}"`);
  }

  const key = validateDataExtensionFieldKey(input.key);
  const inverseKey = validateDataExtensionFieldKey(input.inverseKey);

  // Uniqueness is enforced by an index on one collection; a source that
  // spans several (vendors, clients) could link one target twice.
  if (
    input.kind === 'oneToOne' &&
    (getDataExtensionRecordType(input.recordType)?.storages.length || 0) > 1
  ) {
    fail(
      'One-to-one links cannot start from a record type stored in several places; use belongs-to instead',
    );
  }

  if (input.recordType === input.targetRecordType && key === inverseKey) {
    fail('A relation to the same record type needs two different keys');
  }

  return {
    source: {
      recordType: input.recordType,
      key,
      label: cleanText(
        input.label,
        'Label',
        DATA_EXTENSION_LIMITS.labelLength,
        true,
      ) as string,
      description: cleanText(
        input.description,
        'Description',
        DATA_EXTENSION_LIMITS.descriptionLength,
        false,
      ),
      type: 'relation',
      relation: {
        targetRecordType: input.targetRecordType,
        kind: input.kind,
        side: 'source',
      },
      order: 0,
    },
    inverse: {
      recordType: input.targetRecordType,
      key: inverseKey,
      label: cleanText(
        input.inverseLabel,
        'Inverse label',
        DATA_EXTENSION_LIMITS.labelLength,
        true,
      ) as string,
      description: cleanText(
        input.inverseDescription,
        'Description',
        DATA_EXTENSION_LIMITS.descriptionLength,
        false,
      ),
      type: 'relation',
      relation: {
        targetRecordType: input.recordType,
        kind: input.kind,
        side: 'inverse',
      },
      order: 0,
    },
  };
};

/**
 * Key and type are fixed once created: stored values were validated against
 * them. Options may be relabelled or added but not removed, so no stored
 * value is orphaned by an edit.
 */
type DataExtensionFieldEditable = Pick<
  IDataExtensionField,
  'label' | 'description' | 'options' | 'order' | 'settings'
>;

export const validateDataExtensionFieldEdit = (
  existing: Pick<IDataExtensionField, 'type' | 'options' | 'settings'>,
  input: IDataExtensionFieldEditInput,
): Partial<DataExtensionFieldEditable> => {
  const update: Partial<DataExtensionFieldEditable> = {};

  if (input.label !== undefined) {
    update.label = cleanText(
      input.label,
      'Label',
      DATA_EXTENSION_LIMITS.labelLength,
      true,
    );
  }

  if (input.description !== undefined) {
    update.description =
      cleanText(
        input.description,
        'Description',
        DATA_EXTENSION_LIMITS.descriptionLength,
        false,
      ) || '';
  }

  if (input.order !== undefined && input.order !== null) {
    update.order = normalizeOrder(input.order);
  }

  if (input.options !== undefined && input.options !== null) {
    if (!hasOptions(existing.type)) {
      fail('Only select fields take options');
    }

    const options = normalizeOptions(input.options);
    const nextValues = new Set(options.map((option) => option.value));
    const removed = (existing.options || []).filter(
      (option) => !nextValues.has(option.value),
    );

    if (removed.length) {
      fail(
        `Options cannot be removed: ${removed.map((option) => option.value).join(', ')}`,
      );
    }

    update.options = options;
  }

  if (input.settings !== undefined && input.settings !== null) {
    // Empty settings object clears them; `previous` keeps fixed ones fixed.
    update.settings =
      validateDataExtensionFieldSettings(
        existing.type,
        input.settings,
        update.options || existing.options,
        existing.settings || {},
      ) || {};
  }

  return update;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9 ()-]{3,32}$/;

const normalizeString = (
  field: IDataExtensionField,
  value: unknown,
  maxLength: number,
): string => {
  if (typeof value !== 'string') {
    return fail(`${field.key} must be a string`);
  }

  if (value.length > maxLength) {
    return fail(`${field.key} must be at most ${maxLength} characters`);
  }

  return value;
};

const optionValues = (field: IDataExtensionField) =>
  new Set((field.options || []).map((option) => option.value));

const normalizeRecordId = (field: IDataExtensionField, value: unknown) =>
  typeof value === 'string' && value.length > 0 && value.length <= 64
    ? value
    : fail(`${field.key} must be a record id`);

const normalizeRelation = (
  field: IDataExtensionField,
  value: unknown,
): string | string[] => {
  if (field.relation?.side !== 'source') {
    return fail(
      `${field.key} is the other side of a relation; links are stored on the linked records`,
    );
  }

  if (field.relation.kind !== 'manyToMany') {
    return normalizeRecordId(field, value);
  }

  if (!Array.isArray(value)) {
    return fail(`${field.key} must be a list of record ids`);
  }

  if (value.length > DATA_EXTENSION_LIMITS.relationIdsPerValue) {
    return fail(
      `${field.key} links at most ${DATA_EXTENSION_LIMITS.relationIdsPerValue} records`,
    );
  }

  return Array.from(
    new Set(value.map((item) => normalizeRecordId(field, item))),
  );
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeEmail = (field: IDataExtensionField, value: unknown) => {
  const email = normalizeString(field, value, 320).trim();

  return EMAIL_PATTERN.test(email)
    ? email
    : fail(`${field.key} must be a valid email address`);
};

const normalizePhone = (field: IDataExtensionField, value: unknown) => {
  const phone = normalizeString(field, value, 32).trim();

  return PHONE_PATTERN.test(phone)
    ? phone
    : fail(`${field.key} must be a valid phone number`);
};

const normalizeHttpUrl = (field: IDataExtensionField, value: unknown) => {
  const url = normalizeString(field, value, 2048).trim();

  try {
    const parsed = new URL(url);

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch {
    // Falls through to the validation error below.
  }

  return fail(`${field.key} must be an http(s) URL`);
};

const normalizeDate = (field: IDataExtensionField, value: unknown) => {
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string'
        ? new Date(value)
        : null;

  return date && !Number.isNaN(date.getTime())
    ? date
    : fail(`${field.key} must be an ISO date`);
};

const normalizeFiniteNumber = (field: IDataExtensionField, value: unknown) =>
  typeof value === 'number' && Number.isFinite(value)
    ? value
    : fail(`${field.key} must be a finite number`);

/** Applies `min`/`max` from the field's settings. */
const inRange = (field: IDataExtensionField, value: number) => {
  const { min, max } = field.settings || {};

  if (min !== undefined && value < min) {
    fail(`${field.key} must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    fail(`${field.key} must be at most ${max}`);
  }

  return value;
};

/** A list value: at most `listItems` entries, each normalised, no repeats. */
const normalizeList = <T>(
  field: IDataExtensionField,
  value: unknown,
  item: (entry: unknown) => T,
  identity: (entry: T) => string,
): T[] => {
  if (!Array.isArray(value)) {
    return fail(`${field.key} must be a list`);
  }

  if (value.length > DATA_EXTENSION_LIMITS.listItems) {
    return fail(
      `${field.key} holds at most ${DATA_EXTENSION_LIMITS.listItems} items`,
    );
  }

  const seen = new Set<string>();
  const items: T[] = [];

  for (const entry of value) {
    const normalized = item(entry);
    const id = identity(normalized);

    if (!seen.has(id)) {
      seen.add(id);
      items.push(normalized);
    }
  }

  return items;
};

const optionalPart = (
  field: IDataExtensionField,
  value: unknown,
  name: string,
  maxLength: number,
) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    return fail(`${field.key}.${name} must be a string`);
  }

  if (value.length > maxLength) {
    return fail(`${field.key}.${name} must be at most ${maxLength} characters`);
  }

  return value.trim() || undefined;
};

/** Only the listed parts, trimmed; empty parts are dropped. */
const normalizeParts = (
  field: IDataExtensionField,
  value: unknown,
  parts: readonly string[],
  maxLength: number,
) => {
  if (!isPlainObject(value)) {
    return fail(`${field.key} must be an object`);
  }

  for (const key of Object.keys(value)) {
    if (!parts.includes(key) && key !== '__typename') {
      fail(`${field.key} has no part "${key}"`);
    }
  }

  const result: Record<string, string> = {};

  for (const part of parts) {
    const text = optionalPart(field, value[part], part, maxLength);

    if (text) {
      result[part] = text;
    }
  }

  if (!Object.keys(result).length) {
    return fail(`${field.key} needs at least one part; send null to clear it`);
  }

  return result;
};

/**
 * Uploaded file references: an http(s) URL or an erxes storage key. Keys
 * cannot carry a scheme, climb directories or start at the root, so the UI
 * can always resolve them through erxes' own file route.
 */
const normalizeFileReference = (field: IDataExtensionField, value: unknown) => {
  const ref = normalizeString(field, value, 2048).trim();

  if (ref.includes(':')) {
    return normalizeHttpUrl(field, ref);
  }

  if (!ref || ref.startsWith('/') || ref.includes('..') || /\s/.test(ref)) {
    return fail(`${field.key} has an invalid file reference`);
  }

  return ref;
};

const normalizeFile = (field: IDataExtensionField, value: unknown) => {
  if (!isPlainObject(value)) {
    return fail(`${field.key} must list files as objects`);
  }

  const name = cleanText(
    value.name,
    `${field.key}.name`,
    DATA_EXTENSION_LIMITS.fileNameLength,
    true,
  ) as string;
  const file: Record<string, unknown> = {
    url: normalizeFileReference(field, value.url),
    name,
  };
  const type = optionalPart(field, value.type, 'type', 100);

  if (type) {
    file.type = type;
  }

  if (value.size !== undefined && value.size !== null) {
    if (
      typeof value.size !== 'number' ||
      !Number.isInteger(value.size) ||
      value.size < 0
    ) {
      fail(`${field.key}.size must be a whole number of bytes`);
    }

    file.size = value.size;
  }

  return file;
};

/** JSON safe to store under a Mongo path: bounded depth and size, no operators. */
const assertStorableJson = (
  field: IDataExtensionField,
  value: unknown,
  depth: number,
): void => {
  if (depth > DATA_EXTENSION_LIMITS.jsonDepth) {
    fail(`${field.key} is nested too deeply`);
  }

  if (value === null || ['string', 'boolean'].includes(typeof value)) {
    return;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      fail(`${field.key} must only hold finite numbers`);
    }

    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => assertStorableJson(field, item, depth + 1));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (!key || key.startsWith('$') || key.includes('.')) {
        fail(`${field.key} keys cannot be empty, start with $ or contain dots`);
      }

      assertStorableJson(field, item, depth + 1);
    }

    return;
  }

  fail(`${field.key} must be JSON`);
};

const normalizeJson = (field: IDataExtensionField, value: unknown) => {
  if (!isPlainObject(value) && !Array.isArray(value)) {
    return fail(`${field.key} must be a JSON object or list`);
  }

  assertStorableJson(field, value, 0);

  if (
    Buffer.byteLength(JSON.stringify(value), 'utf8') >
    DATA_EXTENSION_LIMITS.jsonBytes
  ) {
    fail(`${field.key} is larger than ${DATA_EXTENSION_LIMITS.jsonBytes} bytes`);
  }

  return value as Record<string, unknown> | unknown[];
};

const normalizeMember = (field: IDataExtensionField, value: unknown) => {
  if (!field.settings?.multiple) {
    return normalizeRecordId(field, value);
  }

  if (!Array.isArray(value)) {
    return fail(`${field.key} must be a list of team member ids`);
  }

  if (value.length > DATA_EXTENSION_LIMITS.membersPerValue) {
    return fail(
      `${field.key} holds at most ${DATA_EXTENSION_LIMITS.membersPerValue} team members`,
    );
  }

  return Array.from(new Set(value.map((id) => normalizeRecordId(field, id))));
};

/** Validates and normalises one non-null value for its field. */
export const normalizeDataExtensionValue = (
  field: IDataExtensionField,
  value: unknown,
): DataExtensionValue => {
  switch (field.type) {
    case 'currency': {
      if (!isPlainObject(value)) {
        return fail(`${field.key} must be { amount, currency }`);
      }

      const currency =
        typeof value.currency === 'string' && value.currency
          ? value.currency.toUpperCase()
          : field.settings?.currency;

      if (!currency || !CURRENCY_CODE_PATTERN.test(currency)) {
        return fail(`${field.key} needs a 3-letter currency code`);
      }

      return {
        amount: inRange(field, normalizeFiniteNumber(field, value.amount)),
        currency,
      };
    }
    case 'dateTime':
      return normalizeDate(field, value);
    case 'rating': {
      const scale = field.settings?.scale || 5;

      return typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 1 &&
        value <= scale
        ? value
        : fail(`${field.key} must be a whole number from 1 to ${scale}`);
    }
    case 'percent':
      return inRange(field, normalizeFiniteNumber(field, value));
    case 'address':
      return normalizeParts(
        field,
        value,
        DATA_EXTENSION_ADDRESS_PARTS,
        DATA_EXTENSION_LIMITS.addressPartLength,
      );
    case 'fullName':
      return normalizeParts(
        field,
        value,
        ['firstName', 'lastName'],
        DATA_EXTENSION_LIMITS.labelLength,
      );
    case 'links':
      return normalizeList(
        field,
        value,
        (entry) => {
          if (!isPlainObject(entry)) {
            return fail(`${field.key} must list links as { url, label }`);
          }

          const link: { url: string; label?: string } = {
            url: normalizeHttpUrl(field, entry.url),
          };
          const label = optionalPart(
            field,
            entry.label,
            'label',
            DATA_EXTENSION_LIMITS.labelLength,
          );

          if (label) {
            link.label = label;
          }

          return link;
        },
        (link) => link.url,
      );
    case 'emails':
      return normalizeList(
        field,
        value,
        (entry) => normalizeEmail(field, entry),
        (email) => email.toLowerCase(),
      );
    case 'phones':
      return normalizeList(
        field,
        value,
        (entry) => normalizePhone(field, entry),
        (phone) => phone.replace(/[^0-9+]/g, ''),
      );
    case 'files':
      return normalizeList(
        field,
        value,
        (entry) => normalizeFile(field, entry),
        (file) => String(file.url),
      ) as DataExtensionValue;
    case 'member':
      return normalizeMember(field, value);
    case 'json':
      return normalizeJson(field, value);
    default:
      return normalizeBaseValue(field, value);
  }
};

/** The original eleven types, with length and range settings applied. */
const normalizeBaseValue = (
  field: IDataExtensionField,
  value: unknown,
): DataExtensionValue => {
  const maxLength = field.settings?.maxLength;

  switch (field.type) {
    case 'text':
      return normalizeString(
        field,
        value,
        maxLength || DATA_EXTENSION_LIMITS.textLength,
      );
    case 'longText':
      return normalizeString(
        field,
        value,
        maxLength || DATA_EXTENSION_LIMITS.longTextLength,
      );
    case 'email': {
      const email = normalizeString(field, value, 320).trim();

      return EMAIL_PATTERN.test(email)
        ? email
        : fail(`${field.key} must be a valid email address`);
    }
    case 'phone': {
      const phone = normalizeString(field, value, 32).trim();

      return PHONE_PATTERN.test(phone)
        ? phone
        : fail(`${field.key} must be a valid phone number`);
    }
    case 'url': {
      const url = normalizeString(field, value, 2048).trim();

      try {
        const parsed = new URL(url);

        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return url;
        }
      } catch {
        // Falls through to the validation error below.
      }

      return fail(`${field.key} must be an http(s) URL`);
    }
    case 'number':
      return inRange(field, normalizeFiniteNumber(field, value));
    case 'boolean':
      return typeof value === 'boolean'
        ? value
        : fail(`${field.key} must be a boolean`);
    case 'date': {
      const date =
        value instanceof Date
          ? value
          : typeof value === 'string'
            ? new Date(value)
            : null;

      return date && !Number.isNaN(date.getTime())
        ? date
        : fail(`${field.key} must be an ISO date`);
    }
    case 'select': {
      const selected = normalizeString(field, value, 100);

      return optionValues(field).has(selected)
        ? selected
        : fail(`${field.key} must be one of its options`);
    }
    case 'multiSelect': {
      if (!Array.isArray(value)) {
        return fail(`${field.key} must be a list`);
      }

      if (value.length > DATA_EXTENSION_LIMITS.multiSelectValues) {
        return fail(
          `${field.key} accepts at most ${DATA_EXTENSION_LIMITS.multiSelectValues} values`,
        );
      }

      const allowed = optionValues(field);
      const selected = Array.from(new Set(value));

      for (const item of selected) {
        if (typeof item !== 'string' || !allowed.has(item)) {
          fail(`${field.key} must only contain its options`);
        }
      }

      return selected as string[];
    }
    case 'relation':
      return normalizeRelation(field, value);
    default:
      return fail(`Unsupported field type for ${field.key}`);
  }
};

/**
 * Turns a per-key patch into dotted `$set`/`$unset` paths. Omitted keys stay
 * unchanged, `null` clears a key, and the namespace is never replaced whole.
 */
export const buildDataExtensionPatch = (
  activeFields: IDataExtensionField[],
  values: Record<string, unknown>,
): IDataExtensionPatchUpdate => {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return fail('Values must be an object');
  }

  const keys = Object.keys(values);

  if (!keys.length) {
    return fail('Nothing to update');
  }

  if (keys.length > DATA_EXTENSION_LIMITS.patchKeys) {
    return fail(
      `At most ${DATA_EXTENSION_LIMITS.patchKeys} values can be set at once`,
    );
  }

  const fieldsByKey = new Map(activeFields.map((field) => [field.key, field]));
  const update: IDataExtensionPatchUpdate = { $set: {}, $unset: {} };

  for (const key of keys) {
    const field = fieldsByKey.get(key);

    if (!field) {
      fail(`Unknown or inactive field "${key}"`);
      continue;
    }

    const path = `${DATA_EXTENSIONS_NAMESPACE}.${key}`;
    const value = values[key];

    if (field.relation && field.relation.side !== 'source') {
      fail(`${key} is the other side of a relation; links are stored on the linked records`);
    }

    if (value === undefined) {
      continue;
    }

    const normalized =
      value === null ? null : normalizeDataExtensionValue(field, value);

    if (field.settings?.required && isEmptyDataExtensionValue(normalized)) {
      fail(`${field.label || key} is required`);
    }

    if (normalized === null) {
      update.$unset[path] = '';
    } else {
      update.$set[path] = normalized;
    }
  }

  return update;
};

/** Null, blank text and empty lists count as no value. */
export const isEmptyDataExtensionValue = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && !value.trim()) ||
  (Array.isArray(value) && value.length === 0);

/** Keeps only the stored values the caller's record type is allowed to see. */
export const pickDataExtensionValues = (
  stored: unknown,
  activeFields: Pick<IDataExtensionField, 'key'>[],
): Record<string, unknown> => {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {};
  }

  const source = stored as Record<string, unknown>;
  const picked: Record<string, unknown> = {};

  for (const { key } of activeFields) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      picked[key] = source[key];
    }
  }

  return picked;
};

export interface IDataExtensionObjectCreateInput {
  key: string;
  singularLabel: string;
  pluralLabel: string;
  description?: string | null;
  icon?: string | null;
}

export type IDataExtensionObjectEditInput = Partial<
  Omit<IDataExtensionObjectCreateInput, 'key'>
>;

const normalizeObjectIcon = (icon: unknown) => {
  if (icon === undefined || icon === null || icon === '') {
    return undefined;
  }

  return (DATA_EXTENSION_OBJECT_ICONS as readonly string[]).includes(
    icon as string,
  )
    ? (icon as string)
    : fail(`Unknown icon "${String(icon)}"`);
};

/**
 * A custom object's definition. The key names its record type
 * (`custom:<key>`), its collection and its GraphQL type, so it is fixed
 * once created; labels and icon can change.
 */
export const validateDataExtensionObjectCreate = (
  input: IDataExtensionObjectCreateInput,
) => {
  if (
    typeof input.key !== 'string' ||
    !DATA_EXTENSION_OBJECT_KEY_PATTERN.test(input.key)
  ) {
    fail(
      'Object key must start with a lowercase letter and use 2-40 letters and digits',
    );
  }

  const singularLabel = cleanText(
    input.singularLabel,
    'Singular name',
    DATA_EXTENSION_LIMITS.labelLength,
    true,
  ) as string;
  const pluralLabel = cleanText(
    input.pluralLabel,
    'Plural name',
    DATA_EXTENSION_LIMITS.labelLength,
    true,
  ) as string;

  if (singularLabel.toLowerCase() === pluralLabel.toLowerCase()) {
    fail('Singular and plural names must differ');
  }

  return {
    key: input.key,
    singularLabel,
    pluralLabel,
    description: cleanText(
      input.description,
      'Description',
      DATA_EXTENSION_LIMITS.descriptionLength,
      false,
    ),
    icon: normalizeObjectIcon(input.icon),
  };
};

export const validateDataExtensionObjectEdit = (
  existing: { singularLabel: string; pluralLabel: string },
  input: IDataExtensionObjectEditInput,
) => {
  const update: Record<string, string | undefined> = {};

  if (input.singularLabel !== undefined) {
    update.singularLabel = cleanText(
      input.singularLabel,
      'Singular name',
      DATA_EXTENSION_LIMITS.labelLength,
      true,
    );
  }

  if (input.pluralLabel !== undefined) {
    update.pluralLabel = cleanText(
      input.pluralLabel,
      'Plural name',
      DATA_EXTENSION_LIMITS.labelLength,
      true,
    );
  }

  const singular = update.singularLabel ?? existing.singularLabel;
  const plural = update.pluralLabel ?? existing.pluralLabel;

  if (singular.toLowerCase() === plural.toLowerCase()) {
    fail('Singular and plural names must differ');
  }

  if (input.description !== undefined) {
    update.description =
      cleanText(
        input.description,
        'Description',
        DATA_EXTENSION_LIMITS.descriptionLength,
        false,
      ) || '';
  }

  if (input.icon !== undefined) {
    update.icon = normalizeObjectIcon(input.icon) || '';
  }

  return update;
};

export const normalizeDataExtensionRecordName = (name: unknown): string =>
  cleanText(
    name,
    'Name',
    DATA_EXTENSION_LIMITS.recordNameLength,
    true,
  ) as string;

/**
 * Values for a record being created: defaults fill keys not given, then
 * every value is checked as on any write and required fields must be set.
 */
export const buildDataExtensionCreateValues = (
  activeFields: IDataExtensionField[],
  values: Record<string, unknown> = {},
): Record<string, DataExtensionValue> => {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return fail('Values must be an object');
  }

  const withDefaults: Record<string, unknown> = { ...values };

  for (const field of activeFields) {
    const fallback = field.settings?.defaultValue;

    if (
      withDefaults[field.key] === undefined &&
      fallback !== undefined &&
      fallback !== null
    ) {
      withDefaults[field.key] = fallback;
    }
  }

  const stored: Record<string, DataExtensionValue> = {};

  if (Object.keys(withDefaults).length) {
    const patch = buildDataExtensionPatch(activeFields, withDefaults);

    for (const [path, value] of Object.entries(patch.$set)) {
      stored[path.slice(DATA_EXTENSIONS_NAMESPACE.length + 1)] = value;
    }
  }

  for (const field of activeFields) {
    if (
      field.settings?.required &&
      !field.relation &&
      isEmptyDataExtensionValue(stored[field.key])
    ) {
      fail(`${field.label || field.key} is required`);
    }
  }

  return stored;
};
