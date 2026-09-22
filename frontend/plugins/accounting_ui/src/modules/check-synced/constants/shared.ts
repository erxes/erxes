import {
  AccountingCheckSyncedResponse,
  AccountingCheckSyncedStatus,
} from '../deals/types';
import { useCallback, useMemo } from 'react';

import { ApolloError } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type CheckOptions = {
  silent?: boolean;
  keepToSyncIds?: boolean;
  statusById?: Record<string, AccountingCheckSyncedStatus>;
};

export const getSyncStatus = (item?: {
  syncStatus?: AccountingCheckSyncedStatus;
}): AccountingCheckSyncedStatus => item?.syncStatus || 'skipped';


export const chunkIds = (ids: string[], size: number) => {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }

  return chunks;
};

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


export const useSyncSelectedIds = (toSyncIds: Record<string, boolean>) =>
  useMemo(
    () =>
      Object.entries(toSyncIds)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [toSyncIds],
  );


export const isSyncable = (item?: { syncStatus?: string }) =>
  getSyncStatus(item as Parameters<typeof getSyncStatus>[0]) !== 'skipped';


export const useAccountingCheckSyncedAction = <
  TItem extends {
    isSynced?: boolean;
    syncStatus?: AccountingCheckSyncedStatus;
    syncedDate?: string;
    syncedBillNumber?: string;
    syncedCustomer?: string;
  },
>({
  contentType,
  setCheckedItems,
  setToSyncIds,
  checkSyncedMutation,
  warningMsg,
  successMsg,
}: {
  contentType: string;
  setCheckedItems: (
    update: (
      prev: Record<string, Partial<TItem>>,
    ) => Record<string, Partial<TItem>>,
  ) => void;
  setToSyncIds: (
    update: (prev: Record<string, boolean>) => Record<string, boolean>,
  ) => void;
  checkSyncedMutation: (options: {
    variables: { ids: string[]; contentType: string };
    onError?: (error: ApolloError) => void;
  }) => Promise<{
    data?: { accountingCheckSynced?: AccountingCheckSyncedResponse[] } | null;
  } | null>;
  warningMsg: string;
  successMsg: string;
}) => {
  const { t } = useTranslation('accounting');
  const { toast } = useToast();

  const checkItems = useCallback(
    async (ids: string[], checkOptions?: CheckOptions) => {
      if (!ids.length) {
        if (!checkOptions?.silent) {
          toast({
            title: t('warning'),
            description: t(warningMsg),
            variant: 'destructive',
          });
        }
        return;
      }

      const response = await checkSyncedMutation({
        variables: { ids, contentType },
        onError: (error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      const checked = response?.data?.accountingCheckSynced || [];

      setCheckedItems((current) => {
        const next = { ...current };

        for (const item of checked) {
          const syncStatus =
            checkOptions?.statusById?.[item._id] ||
            (item.isSynced ? 'synced' : 'checked');

          next[item._id] = {
            isSynced: item.isSynced,
            syncStatus,
            syncedDate: item.syncedDate,
            syncedBillNumber: item.syncedBillNumber,
            syncedCustomer: item.syncedCustomer,
          } as Partial<TItem>;
        }

        return next;
      });

      setToSyncIds((current) => {
        if (checkOptions?.keepToSyncIds) {
          return current;
        }

        const idsToRemove = new Set(
          checked.filter((item) => item.isSynced).map((item) => item._id),
        );

        const next: Record<string, boolean> = {};

        for (const [key, value] of Object.entries(current)) {
          if (!idsToRemove.has(key)) {
            next[key] = value;
          }
        }

        for (const item of checked) {
          if (!item.isSynced) {
            next[item._id] = true;
          }
        }

        return next;
      });

      if (!checkOptions?.silent) {
        toast({
          title: t('success'),
          description: t(successMsg, { count: checked.length }),
        });
      }
    },
    [
      contentType,
      setCheckedItems,
      setToSyncIds,
      checkSyncedMutation,
      warningMsg,
      successMsg,
      t,
      toast,
    ],
  );

  return checkItems;
};
