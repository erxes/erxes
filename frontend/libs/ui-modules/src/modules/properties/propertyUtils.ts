import { IField, IFieldLogicRule } from './types/fieldsTypes';

// Mirrors `erxes-api-shared/core-modules/properties`.
export const PROPERTY_GROUP_KEY_PREFIX = 'g:';

export const toPropertyGroupKey = (groupId: string) =>
  `${PROPERTY_GROUP_KEY_PREFIX}${groupId}`;

export const isPropertyGroupKey = (key: string) =>
  key.startsWith(PROPERTY_GROUP_KEY_PREFIX);

export const propertyGroupIdFromKey = (key: string) =>
  key.slice(PROPERTY_GROUP_KEY_PREFIX.length);

export const PROPERTY_ROW_KEY_SEP = '/';

export const PROPERTY_ANY_ROW_KEY_SEP = '~';

export const toPropertyRowKey = (
  groupId: string,
  fieldId: string,
  anyRow = false,
) =>
  `${toPropertyGroupKey(groupId)}${
    anyRow ? PROPERTY_ANY_ROW_KEY_SEP : PROPERTY_ROW_KEY_SEP
  }${fieldId}`;

export type ParsedPropertyDataKey =
  | { kind: 'field'; fieldId: string }
  | { kind: 'row'; groupId: string; fieldId: string; anyRow: boolean };

export const parsePropertyDataKey = (key: string): ParsedPropertyDataKey => {
  if (!isPropertyGroupKey(key)) {
    return { kind: 'field', fieldId: key };
  }

  const rest = propertyGroupIdFromKey(key);
  const sameRowSep = rest.indexOf(PROPERTY_ROW_KEY_SEP);
  const anyRowSep = rest.indexOf(PROPERTY_ANY_ROW_KEY_SEP);

  const sep =
    sameRowSep === -1 || (anyRowSep !== -1 && anyRowSep < sameRowSep)
      ? anyRowSep
      : sameRowSep;

  if (sep === -1) {
    return { kind: 'field', fieldId: key };
  }

  return {
    kind: 'row',
    groupId: rest.slice(0, sep),
    fieldId: rest.slice(sep + 1),
    anyRow: rest[sep] === PROPERTY_ANY_ROW_KEY_SEP,
  };
};

// Mirrors what `Fields.validateFieldValue` enforces, so the two never disagree.
const FORMAT_VALIDATIONS = ['number', 'email', 'date'] as const;

type FormatValidation = (typeof FORMAT_VALIDATIONS)[number];

const FORMAT_LABEL: Record<FormatValidation, string> = {
  number: 'Number',
  email: 'Email',
  date: 'Date',
};

const FORMAT_MESSAGE: Record<FormatValidation, string> = {
  number: 'Invalid number',
  email: 'Invalid email',
  date: 'Invalid date',
};

const isFormatValid = (validation: FormatValidation, value: unknown) => {
  const text = String(value).trim();

  if (validation === 'number') {
    return text !== '' && !Number.isNaN(Number(text));
  }

  if (validation === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  }

  return !Number.isNaN(new Date(text).getTime());
};

export const activeFormatValidation = (
  field: IField,
): FormatValidation | null =>
  FORMAT_VALIDATIONS.find((validation) => field.validations?.[validation]) ??
  null;

export const formatValidationLabel = (field: IField): string | null => {
  const validation = activeFormatValidation(field);

  return validation ? FORMAT_LABEL[validation] : null;
};

export const validatePropertyValue = (
  field: IField,
  value: unknown,
): string | null => {
  if (!hasFieldValue(value)) {
    // `isRequired` is deliberately not checked here: the server enforces
    // `validations.required` only, and this must not reject what it accepts
    return field.validations?.required ? `${field.name}: required` : null;
  }

  const validation = activeFormatValidation(field);

  if (validation && !isFormatValid(validation, value)) {
    return `${field.name}: ${FORMAT_MESSAGE[validation]}`;
  }

  return null;
};

export const getStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((val) => typeof val === 'string');
  }
  return [];
};

const valueMatches = (actual: unknown, expected: string): boolean => {
  if (Array.isArray(actual)) {
    return actual.some((item) => String(item) === expected);
  }
  return String(actual ?? '') === expected;
};

export const hasFieldValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

export const formatFieldValue = (field: IField, value: unknown): string => {
  if (Array.isArray(value)) {
    if (field.options?.length) {
      return value
        .map(
          (item) =>
            field.options?.find((option) => option.value === item)?.label ??
            String(item),
        )
        .join(', ');
    }

    return value.join(', ');
  }

  if (field.options?.length) {
    return (
      field.options.find((option) => option.value === value)?.label ??
      String(value)
    );
  }

  if (field.type === 'boolean' || field.type === 'check') {
    return value ? 'Yes' : 'No';
  }

  if (field.type === 'date') {
    const date = new Date(value as string);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString();
  }

  return String(value);
};

export const isFieldVisibleByLogic = (
  field: Pick<IField, 'logics'>,
  valuesByFieldId: Record<string, unknown>,
): boolean => {
  const rules = Array.isArray(field.logics)
    ? (field.logics as IFieldLogicRule[]).filter((rule) => rule.field)
    : [];

  if (rules.length === 0) return true;

  const action = rules[0]?.action === 'hide' ? 'hide' : 'show';

  const allMatch = rules.every((rule) => {
    const matches = valueMatches(valuesByFieldId[rule.field], rule.value ?? '');
    return rule.operator === 'isNot' ? !matches : matches;
  });

  return action === 'show' ? allMatch : !allMatch;
};
