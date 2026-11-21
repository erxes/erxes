import type {
  DataExtensionField,
  DataExtensionFieldSettings,
  DataExtensionValues,
} from '@erxes/core-contract';
import { isApiError } from '@erxes/core-contract/client';
import { isComputedType } from './fieldTypes';

/** One value as the API holds it: JSON, or null when cleared. */
export type Value = DataExtensionValues[string];

type Condition = NonNullable<DataExtensionFieldSettings['visibleWhen']>;

/** No value: null, blank text, an empty list, or a composite with every part empty (as the API reads it). */
const isEmptyValue = (value: Value | undefined): boolean => {
  if (value === null || value === undefined || value === '') return true;

  if (Array.isArray(value)) return value.length === 0;

  return typeof value === 'object' && Object.values(value).every(isEmptyValue);
};

const same = (a: Value | undefined, b: Value | undefined) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** `value` matches `wanted`; a list matches when one of its items does. */
const matches = (value: Value | undefined, wanted: Value | undefined) =>
  Array.isArray(value) ? value.some((item) => same(item, wanted)) : same(value, wanted);

/** Whether the record's values meet a field's condition, as the API checks it on each write. */
const conditionHolds = (condition: Condition, values: DataExtensionValues) => {
  const value = values[condition.field] ?? null;

  switch (condition.operator) {
    case 'isNotEmpty':
      return !isEmptyValue(value);
    case 'eq':
      return matches(value, condition.value);
    case 'neq':
      return !matches(value, condition.value);
    case 'in':
      return (
        Array.isArray(condition.value) && condition.value.some((wanted) => matches(value, wanted))
      );
  }
};

/** How a field shows on a form, given the record's values now. */
export const fieldState = (field: DataExtensionField, values: DataExtensionValues) => {
  const { visibleWhen, requiredWhen, required, readOnly } = field.settings;

  return {
    visible: !visibleWhen || conditionHolds(visibleWhen, values),
    required: Boolean(required) || Boolean(requiredWhen && conditionHolds(requiredWhen, values)),
    /** Computed, numbered or read-only: shown, never typed in. */
    locked: isComputedType(field.type) || Boolean(readOnly),
  };
};

/** The fields a form asks for: active, writable ones, in order; on create those `showInCreate`. */
export const formFields = (fields: DataExtensionField[], creating: boolean) =>
  fields.filter(
    (field) =>
      field.status === 'active' &&
      (!creating || (field.settings.showInCreate !== false && !isComputedType(field.type))),
  );

/** Only the values that differ from `before`, so a save sends what the member changed. */
export const changedValues = (before: DataExtensionValues, after: DataExtensionValues) =>
  Object.fromEntries(Object.entries(after).filter(([key, value]) => !same(before[key], value)));

/** Each field's problem from a failed write: required ones, refused values, taken ones. */
export const fieldErrorsOf = (error: unknown): Record<string, string> => {
  if (isApiError(error, 'TAKEN') && error.data.field.startsWith('values.')) {
    return { [error.data.field.slice('values.'.length)]: error.message };
  }

  if (isApiError(error, 'INVALID_INPUT')) {
    return Object.fromEntries(
      error.data.issues.flatMap((issue) => {
        const [first, key] = issue.path;

        return first === 'values' && typeof key === 'string' ? [[key, issue.message]] : [];
      }),
    );
  }

  return {};
};
