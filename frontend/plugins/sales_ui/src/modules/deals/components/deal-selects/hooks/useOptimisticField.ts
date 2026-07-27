import { useCallback, useEffect, useRef, useState } from 'react';

type FieldValueCommit<T> = (
  value: T,
  previousValue: T,
) => PromiseLike<unknown> | void;

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

  const isCurrentGeneration = useCallback(
    (queuedValue: QueuedValue<T>) =>
      queuedValue.generation === generationRef.current,
    [],
  );

  const protectValueUntilSourceCatchesUp = useCallback((nextValue: T) => {
    protectedValueRef.current = {
      active: !isEqualRef.current(sourceValueRef.current, nextValue),
      value: nextValue,
    };
  }, []);

  const confirmQueuedValue = useCallback(
    (queuedValue: QueuedValue<T>) => {
      if (!isCurrentGeneration(queuedValue)) {
        return;
      }

      confirmedValueRef.current = queuedValue.value;

      const isLatestValue =
        queuedValue.version === versionRef.current &&
        queuedValueRef.current === null;

      if (isLatestValue) {
        protectValueUntilSourceCatchesUp(queuedValue.value);
      }
    },
    [isCurrentGeneration, protectValueUntilSourceCatchesUp],
  );

  const rollbackQueuedValue = useCallback(
    (queuedValue: QueuedValue<T>) => {
      if (!isCurrentGeneration(queuedValue)) {
        return;
      }

      const hasNewerValue =
        queuedValue.version !== versionRef.current ||
        queuedValueRef.current !== null;

      if (hasNewerValue) {
        return;
      }

      const rollbackValue = confirmedValueRef.current;
      protectValueUntilSourceCatchesUp(rollbackValue);
      updateDisplayedValue(rollbackValue);
    },
    [
      isCurrentGeneration,
      protectValueUntilSourceCatchesUp,
      updateDisplayedValue,
    ],
  );

  const commitQueuedValue = useCallback(
    async (queuedValue: QueuedValue<T>) => {
      if (!isCurrentGeneration(queuedValue)) {
        return;
      }

      const previousValue = confirmedValueRef.current;

      try {
        await onCommitRef.current(queuedValue.value, previousValue);
        confirmQueuedValue(queuedValue);
      } catch {
        rollbackQueuedValue(queuedValue);
      }
    },
    [confirmQueuedValue, isCurrentGeneration, rollbackQueuedValue],
  );

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
      await commitQueuedValue(queuedValue);
    }

    runningRef.current = false;
    if (mountedRef.current) {
      setSaving(false);
    }
  }, [commitQueuedValue]);

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
