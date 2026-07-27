import { useCallback, useEffect, useRef, useState } from 'react';

type FieldValueCommit<T> = (
  value: T,
  previousValue: T,
) => Promise<unknown> | unknown;

interface UseOptimisticFieldOptions<T> {
  value: T;
  onCommit: FieldValueCommit<T>;
  resetKey?: string;
  isEqual?: (left: T, right: T) => boolean;
}

interface QueuedValue<T> {
  generation: number;
  value: T;
  version: number;
}

interface ProtectedValue<T> {
  active: boolean;
  value: T;
}

export const areFieldValuesEqual = <T>(left: T, right: T) => {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => Object.is(item, right[index]))
    );
  }

  return Object.is(left, right);
};

export const areIdListsEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((id) => right.includes(id));

export const rejectOnMutationError = async <
  T extends { errors?: unknown } | null,
>(
  mutation: PromiseLike<T>,
) => {
  const result = await mutation;

  if (result?.errors) {
    throw result.errors;
  }

  return result;
};

export const useOptimisticField = <T>({
  value,
  onCommit,
  resetKey,
  isEqual = areFieldValuesEqual,
}: UseOptimisticFieldOptions<T>) => {
  const [optimisticValue, setOptimisticValue] = useState(value);
  const [saving, setSaving] = useState(false);

  const sourceValueRef = useRef(value);
  const displayedValueRef = useRef(value);
  const confirmedValueRef = useRef(value);
  const queuedValueRef = useRef<QueuedValue<T> | null>(null);
  const protectedValueRef = useRef<ProtectedValue<T>>({
    active: false,
    value,
  });
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const versionRef = useRef(0);
  const resetKeyRef = useRef(resetKey);
  const onCommitRef = useRef(onCommit);
  const isEqualRef = useRef(isEqual);

  onCommitRef.current = onCommit;
  isEqualRef.current = isEqual;

  const updateDisplayedValue = useCallback((nextValue: T) => {
    displayedValueRef.current = nextValue;
    if (mountedRef.current) {
      setOptimisticValue(nextValue);
    }
  }, []);

  const drainQueue = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    runningRef.current = true;
    if (mountedRef.current) {
      setSaving(true);
    }

    while (queuedValueRef.current) {
      const queuedValue = queuedValueRef.current;
      queuedValueRef.current = null;

      if (queuedValue.generation !== generationRef.current) {
        continue;
      }

      const previousValue = confirmedValueRef.current;

      try {
        await onCommitRef.current(queuedValue.value, previousValue);

        if (queuedValue.generation !== generationRef.current) {
          continue;
        }

        confirmedValueRef.current = queuedValue.value;

        if (
          queuedValue.version === versionRef.current &&
          !queuedValueRef.current
        ) {
          const sourceIsConfirmed = isEqualRef.current(
            sourceValueRef.current,
            queuedValue.value,
          );

          protectedValueRef.current = {
            active: !sourceIsConfirmed,
            value: queuedValue.value,
          };
        }
      } catch {
        if (queuedValue.generation !== generationRef.current) {
          continue;
        }

        const hasNewerValue =
          queuedValue.version !== versionRef.current ||
          queuedValueRef.current !== null;

        if (!hasNewerValue) {
          const rollbackValue = confirmedValueRef.current;
          protectedValueRef.current = {
            active: !isEqualRef.current(sourceValueRef.current, rollbackValue),
            value: rollbackValue,
          };
          updateDisplayedValue(rollbackValue);
        }
      }
    }

    runningRef.current = false;
    if (mountedRef.current) {
      setSaving(false);
    }
  }, [updateDisplayedValue]);

  const setValue = useCallback(
    (nextValue: T) => {
      if (isEqualRef.current(displayedValueRef.current, nextValue)) {
        return;
      }

      versionRef.current += 1;
      protectedValueRef.current.active = false;
      queuedValueRef.current = {
        generation: generationRef.current,
        value: nextValue,
        version: versionRef.current,
      };
      updateDisplayedValue(nextValue);
      void drainQueue();
    },
    [drainQueue, updateDisplayedValue],
  );

  useEffect(() => {
    sourceValueRef.current = value;

    if (resetKeyRef.current !== resetKey) {
      resetKeyRef.current = resetKey;
      generationRef.current += 1;
      versionRef.current = 0;
      queuedValueRef.current = null;
      confirmedValueRef.current = value;
      protectedValueRef.current = { active: false, value };
      updateDisplayedValue(value);
      return;
    }

    const protectedValue = protectedValueRef.current;
    if (protectedValue.active) {
      if (isEqualRef.current(value, protectedValue.value)) {
        protectedValueRef.current.active = false;
        confirmedValueRef.current = value;
        updateDisplayedValue(value);
      }
      return;
    }

    if (runningRef.current || queuedValueRef.current) {
      return;
    }

    confirmedValueRef.current = value;
    if (!isEqualRef.current(displayedValueRef.current, value)) {
      updateDisplayedValue(value);
    }
  }, [resetKey, updateDisplayedValue, value]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      queuedValueRef.current = null;
    };
  }, []);

  return {
    saving,
    setValue,
    value: optimisticValue,
  };
};
