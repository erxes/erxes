import {
  IconCalendarPlus,
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconRefresh,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Checkbox,
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';

import {
  CheckSyncedDealStatus,
  ICheckSyncedDeals,
} from '../types/checkSyncedDeals';
import { CheckSyncedDealsMoreColumn } from './CheckSyncedDealsMoreColumn';

type CheckSyncedDealsColumnsOptions = {
  toSyncDealIds: Record<string, boolean>;
  syncableDealIds: string[];
  onToggleToSync: (id: string, checked: boolean) => void;
  onToggleAllToSync: (ids: string[], checked: boolean) => void;
  t: (key: string) => string;
};

const syncableStatuses = new Set<CheckSyncedDealStatus>([
  'checked',
  'synced',
  'pending',
  'error',
  'resynced',
]);

const getSyncStatus = (deal: ICheckSyncedDeals): CheckSyncedDealStatus =>
  deal.syncStatus || 'skipped';

export const isSyncableDeal = (deal: ICheckSyncedDeals) =>
  syncableStatuses.has(getSyncStatus(deal));

const stringifyAmount = (amount: unknown) => {
  if (!amount) {
    return '';
  }

  if (typeof amount === 'string') {
    return amount;
  }

  return JSON.stringify(amount);
};

export const getCheckSyncedDealsColumns = ({
  toSyncDealIds,
  syncableDealIds,
  onToggleToSync,
  onToggleAllToSync,
  t,
}: CheckSyncedDealsColumnsOptions): ColumnDef<ICheckSyncedDeals>[] => [
  CheckSyncedDealsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICheckSyncedDeals>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('deal-name')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'number',
    accessorKey: 'number',
    header: () => (
      <RecordTable.InlineHead icon={IconHash} label={t('deal-number')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('amount')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={stringifyAmount(cell.getValue())} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label={t('created-at')} icon={IconCalendarPlus} />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'modifiedAt',
    accessorKey: 'modifiedAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('modified-at')} />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'stageChangedDate',
    accessorKey: 'stageChangedDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('stage-changed-date')} />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'unSynced',
    accessorKey: 'syncStatus',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('sync-status')} />
    ),
    cell: ({ cell }) => {
      const status = (cell.getValue() || 'skipped') as string;

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={status} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'toSync',
    accessorKey: 'toSync',
    header: () => {
      const selectedCount = syncableDealIds.filter((id) => toSyncDealIds[id])
        .length;
      const isAllSelected =
        syncableDealIds.length > 0 && selectedCount === syncableDealIds.length;
      const isSomeSelected = selectedCount > 0 && !isAllSelected;
      const nextChecked = !(isAllSelected || isSomeSelected);

      return (
        <div className="relative z-20 flex items-center justify-center h-8">
          <Checkbox
            key={`${syncableDealIds.length}-${selectedCount}`}
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            disabled={!syncableDealIds.length}
            onCheckedChange={() =>
              onToggleAllToSync(syncableDealIds, nextChecked)
            }
            aria-label="Select all deals to sync"
          />
        </div>
      );
    },
    size: 33,
    cell: ({ row }) => {
      const deal = row.original;
      const disabled = !isSyncableDeal(deal);

      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={!disabled && Boolean(toSyncDealIds[deal._id])}
            disabled={disabled}
            onCheckedChange={(value) =>
              onToggleToSync(deal._id, Boolean(value))
            }
            aria-label="Select deal to sync"
          />
        </div>
      );
    },
  },
  {
    id: 'syncedDate',
    accessorKey: 'syncedDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('synced-date')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'syncedBillNumber',
    accessorKey: 'syncedBillNumber',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('synced-bill-number')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'syncedCustomer',
    accessorKey: 'syncedCustomer',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('synced-customer')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'syncAction',
    accessorKey: 'syncAction',
    header: () => (
      <RecordTable.InlineHead icon={IconRefresh} label={t('sync-action')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
