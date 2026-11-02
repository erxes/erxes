import { useCallback, useRef } from 'react';

export const useSettingsPanelPendingChanges = <T extends object>(
  recordId: string,
) => {
  const pending = useRef<{ recordId: string; changes: Partial<T> }>({
    recordId,
    changes: {},
  });

  return useCallback(
    (
      current: { [K in keyof T]?: unknown },
      changes: Partial<T>,
    ): Partial<T> => {
      const previous: Partial<T> =
        pending.current.recordId === recordId ? pending.current.changes : {};
      const unsynced: Partial<T> = {};

      for (const key of Object.keys(previous) as (keyof T)[]) {
        if (!Object.is(current[key], previous[key])) {
          unsynced[key] = previous[key];
        }
      }

      pending.current = { recordId, changes: { ...unsynced, ...changes } };

      return pending.current.changes;
    },
    [recordId],
  );
};
