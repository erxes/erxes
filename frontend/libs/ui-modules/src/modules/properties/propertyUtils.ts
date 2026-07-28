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
