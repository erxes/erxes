import { IField, IFieldLogicRule } from './types/fieldsTypes';

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
