import {
  DATA_EXTENSION_FIELD_KEY_PATTERN,
  DATA_EXTENSION_FIELD_TYPES,
  DATA_EXTENSION_LIMITS,
  DATA_EXTENSION_RELATION_CREATE_KINDS,
  DATA_EXTENSION_RELATION_KINDS,
  DATA_EXTENSION_RESERVED_KEYS,
  DATA_EXTENSIONS_NAMESPACE,
} from './constants';
import { getDataExtensionRecordType } from './recordTypes';
import {
  DataExtensionFieldType,
  DataExtensionRelationKind,
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionFieldOption,
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
  order?: number | null;
}

export interface IDataExtensionFieldEditInput {
  label?: string | null;
  description?: string | null;
  options?: IDataExtensionFieldOption[] | null;
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

    return { value, label };
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
export const validateDataExtensionFieldEdit = (
  existing: Pick<IDataExtensionField, 'type' | 'options'>,
  input: IDataExtensionFieldEditInput,
): Partial<Pick<IDataExtensionField, 'label' | 'description' | 'options' | 'order'>> => {
  const update: Partial<
    Pick<IDataExtensionField, 'label' | 'description' | 'options' | 'order'>
  > = {};

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

/** Validates and normalises one non-null value for its field. */
export const normalizeDataExtensionValue = (
  field: IDataExtensionField,
  value: unknown,
): DataExtensionValue => {
  switch (field.type) {
    case 'text':
      return normalizeString(field, value, DATA_EXTENSION_LIMITS.textLength);
    case 'longText':
      return normalizeString(
        field,
        value,
        DATA_EXTENSION_LIMITS.longTextLength,
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
      return typeof value === 'number' && Number.isFinite(value)
        ? value
        : fail(`${field.key} must be a finite number`);
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

    if (value === null) {
      update.$unset[path] = '';
    } else if (value !== undefined) {
      update.$set[path] = normalizeDataExtensionValue(field, value);
    }
  }

  return update;
};

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
