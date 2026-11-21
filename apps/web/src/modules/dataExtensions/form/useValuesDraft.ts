import type { DataExtensionValues } from '@erxes/core-contract';
import { isApiError, messageOf } from '@erxes/core-contract/client';
import { useState } from 'react';
import { changedValues, fieldErrorsOf, type Value } from '../values';

/**
 * Values being edited, from the `saved` ones: what changed, and the last save's problems, by
 * field (INVALID_INPUT, TAKEN) or for the form (NOT_ALLOWED and anything else).
 */
export const useValuesDraft = (saved: DataExtensionValues) => {
  const [draft, setDraft] = useState(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const changes = changedValues(saved, draft);

  return {
    draft,
    changes,
    dirty: Object.keys(changes).length > 0,
    errors,
    formError,
    set: (key: string, value: Value) => {
      setDraft((current) => ({ ...current, [key]: value }));
      setErrors((current) =>
        Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)),
      );
    },
    reset: () => {
      setDraft(saved);
      setErrors({});
      setFormError(null);
    },
    /** Shows a failed save: on its fields when it names them, else above the form. */
    failed: (error: unknown) => {
      const byField = fieldErrorsOf(error);

      setErrors(byField);
      setFormError(
        Object.keys(byField).length && !isApiError(error, 'NOT_ALLOWED') ? null : messageOf(error),
      );
    },
    cleared: () => {
      setErrors({});
      setFormError(null);
    },
  };
};

export type ValuesDraft = ReturnType<typeof useValuesDraft>;
