import type { DataExtensionField, DataExtensionValues } from '@erxes/core-contract';
import { conditionHolds, fieldShows } from '@erxes/core-contract/dataExtensionConditions';
import { isApiError } from '@erxes/core-contract/client';
import { isComputedType } from './fieldTypes';

/** One value as the API holds it: JSON, or null when cleared. */
export type Value = DataExtensionValues[string];

const same = (a: Value | undefined, b: Value | undefined) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * How a field shows on a form, given the record's values now, as the API checks it on each
 * write: hidden fields never show.
 */
export const fieldState = (field: DataExtensionField, values: DataExtensionValues) => {
  const { requiredWhen, required, readOnly, hidden } = field.settings;

  return {
    visible: !hidden && fieldShows(field.settings, values),
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
