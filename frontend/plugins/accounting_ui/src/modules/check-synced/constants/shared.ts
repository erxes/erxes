import { useCallback, useMemo } from 'react';
import { AccountingCheckSyncedStatus } from '../deals/types';

export type CheckOptions = {
  silent?: boolean;
  keepToSyncIds?: boolean;
  statusById?: Record<string, AccountingCheckSyncedStatus>;
};

/** get sync status from item. */
export const getSyncStatus = (item?: {
  syncStatus?: AccountingCheckSyncedStatus;
}): AccountingCheckSyncedStatus => item?.syncStatus || 'skipped';

/** split array into chunks. */
export const chunkIds = (ids: string[], size: number) => {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }

  return chunks;
};

/** shared setToSync / setAllToSync toggle logic for check-synced hooks. */
export const useSyncToggle = (
  setToSyncIds: (
    update:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => void,
) => {
  const setToSync = useCallback(
    (id: string, checked: boolean) => {
      setToSyncIds((current) => {
        if (checked) {
          return { ...current, [id]: true };
        }

        const { [id]: _, ...next } = current;
        return next;
      });
    },
    [setToSyncIds],
  );

  const setAllToSync = useCallback(
    (ids: string[], checked: boolean) => {
      setToSyncIds((current) => {
        const removeSet = new Set(checked ? [] : ids);
        const next: Record<string, boolean> = {};

        for (const [key, value] of Object.entries(current)) {
          if (!removeSet.has(key)) {
            next[key] = value;
          }
        }

        if (checked) {
          for (const id of ids) {
            next[id] = true;
          }
        }

        return next;
      });
    },
    [setToSyncIds],
  );

  return { setToSync, setAllToSync };
};

/** filter selected IDs from a toSync record. */
export const useSyncSelectedIds = (toSyncIds: Record<string, boolean>) =>
  useMemo(
    () =>
      Object.entries(toSyncIds)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [toSyncIds],
  );

/** check if item is syncable (not skipped). */
export const isSyncable = (item?: { syncStatus?: string }) =>
  getSyncStatus(item as Parameters<typeof getSyncStatus>[0]) !== 'skipped';
