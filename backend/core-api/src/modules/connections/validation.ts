import {
  CONNECTION_FIELD_KEY_PATTERN,
  CONNECTION_MAX_FIELDS,
  CONNECTION_MAX_VALUE_LENGTH,
  IConnectionFieldDefinition,
  IConnectionTypeDescriptor,
} from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import {
  IConnectionField,
  IConnectionFieldInput,
} from '@/connections/@types/connection';
import {
  isSealedConnectionValue,
  openConnectionValue,
  sealConnectionValue,
} from '@/connections/sealing';

const INVALID = 'BAD_USER_INPUT';
const ICON_PATTERN = /^Icon[A-Za-z0-9]{1,80}$/;
const MAX_NAME_LENGTH = 120;
const MAX_LOGO_LENGTH = 1024;
const MAX_LABEL_LENGTH = 120;

const invalid = (message: string) => new ExpectedError(message, INVALID);

export const normalizeConnectionName = (name: unknown): string => {
  const value = typeof name === 'string' ? name.trim() : '';

  if (!value) {
    throw invalid('Enter a name');
  }

  if (value.length > MAX_NAME_LENGTH) {
    throw invalid(`The name can be at most ${MAX_NAME_LENGTH} characters`);
  }

  return value;
};

/** An icon from the erxes-ui set or an uploaded logo; at least one. */
export const normalizeConnectionAppearance = (
  icon: unknown,
  logo: unknown,
): { icon?: string; logo?: string } => {
  const iconValue = typeof icon === 'string' ? icon.trim() : '';
  const logoValue = typeof logo === 'string' ? logo.trim() : '';

  if (iconValue && !ICON_PATTERN.test(iconValue)) {
    throw invalid('Choose an icon from the icon set');
  }

  if (logoValue.length > MAX_LOGO_LENGTH) {
    throw invalid('The logo address is too long');
  }

  if (!iconValue && !logoValue) {
    throw invalid('Choose an icon or upload a logo');
  }

  return {
    icon: iconValue || undefined,
    logo: logoValue || undefined,
  };
};

const checkFormat = (
  definition: IConnectionFieldDefinition | undefined,
  label: string,
  value: string,
) => {
  if (value.length > (definition?.maxLength ?? CONNECTION_MAX_VALUE_LENGTH)) {
    throw invalid(`${label} is too long`);
  }

  if (!definition || !value) {
    return;
  }

  if (definition.minLength && value.length < definition.minLength) {
    throw invalid(`${label} must be at least ${definition.minLength} characters`);
  }

  if (definition.inputType === 'url') {
    try {
      const url = new URL(value);

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('protocol');
      }
    } catch {
      throw invalid(`${label} must be a valid URL`);
    }
  }

  if (
    definition.inputType === 'email' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    throw invalid(`${label} must be a valid email address`);
  }

  if (definition.inputType === 'number' && !Number.isFinite(Number(value))) {
    throw invalid(`${label} must be a number`);
  }

  if (definition.pattern && !new RegExp(definition.pattern).test(value)) {
    throw invalid(`${label} has an invalid format`);
  }
};

/**
 * Builds the stored fields from user input against the type's field schema.
 *
 * - Schema fields take their label and secret flag from the type; other keys
 *   are accepted only by types that allow custom fields.
 * - An input without a `value` keeps the stored value; an empty string
 *   clears it. A secret field turned plain must be entered again.
 * - Secret values are sealed, bound to this connection id and key.
 */
export const buildConnectionFields = ({
  descriptor,
  connectionId,
  inputs,
  existing = [],
}: {
  descriptor: IConnectionTypeDescriptor;
  connectionId: string;
  inputs: IConnectionFieldInput[];
  existing?: IConnectionField[];
}): IConnectionField[] => {
  if (inputs.length > CONNECTION_MAX_FIELDS) {
    throw invalid(`A connection can have at most ${CONNECTION_MAX_FIELDS} fields`);
  }

  const schemaByKey = new Map(
    descriptor.fields.map((field) => [field.key, field]),
  );
  const existingByKey = new Map(existing.map((field) => [field.key, field]));
  const seen = new Set<string>();
  const fields: IConnectionField[] = [];

  for (const input of inputs) {
    const key = typeof input?.key === 'string' ? input.key.trim() : '';

    if (!CONNECTION_FIELD_KEY_PATTERN.test(key)) {
      throw invalid(
        'Keys start with a letter and contain only letters, numbers and _',
      );
    }

    if (seen.has(key)) {
      throw invalid(`The key "${key}" is used twice`);
    }

    seen.add(key);

    const definition = schemaByKey.get(key);

    if (!definition && !descriptor.allowCustomFields) {
      throw invalid(`"${key}" is not a field of ${descriptor.label}`);
    }

    const secret = definition ? Boolean(definition.secret) : Boolean(input.secret);
    const label = definition
      ? definition.label
      : typeof input.label === 'string' && input.label.trim()
        ? input.label.trim().slice(0, MAX_LABEL_LENGTH)
        : undefined;
    const displayName = label || key;
    const stored = existingByKey.get(key);
    let value: string;

    if (typeof input.value === 'string') {
      checkFormat(definition, displayName, input.value);
      value =
        secret && input.value
          ? sealConnectionValue(connectionId, key, input.value)
          : input.value;
    } else if (!stored || !stored.value) {
      value = '';
    } else if (stored.secret === secret) {
      value = stored.value;
    } else if (secret) {
      // Plain → secret: seal what is stored.
      value = sealConnectionValue(connectionId, key, stored.value);
    } else {
      throw invalid(`Enter a new value for ${displayName}`);
    }

    fields.push({ key, label, secret, value });
  }

  for (const definition of descriptor.fields) {
    const field = fields.find((entry) => entry.key === definition.key);

    if (definition.required && !field?.value) {
      throw invalid(`${definition.label} is required`);
    }
  }

  return fields;
};

/** Decrypts a stored connection's fields; null when a secret does not open. */
export const openConnectionFields = (
  connectionId: string,
  fields: IConnectionField[],
): Record<string, string> | null => {
  const values: Record<string, string> = {};

  for (const field of fields) {
    if (!field.secret || !field.value) {
      values[field.key] = field.value || '';
      continue;
    }

    const opened = isSealedConnectionValue(field.value)
      ? openConnectionValue(connectionId, field.key, field.value)
      : null;

    if (opened === null) {
      return null;
    }

    values[field.key] = opened;
  }

  return values;
};

/** Missing required values for the list status. */
export const hasMissingRequiredFields = (
  descriptor: IConnectionTypeDescriptor | undefined,
  fields: IConnectionField[],
) =>
  Boolean(
    descriptor?.fields.some(
      (definition) =>
        definition.required &&
        !fields.find((field) => field.key === definition.key)?.value,
    ),
  );
