import {
  IconCalendarPlus,
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Checkbox,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AccountingCheckSyncedDeal,
  AccountingCheckSyncedStatus,
} from '../types';

type AccountingCheckSyncedDealsColumnsOptions = {
  toSyncDealIds: Record<string, boolean>;
  syncableDealIds: string[];
  onToggleToSync: (id: string, checked: boolean) => void;
  onToggleAllToSync: (ids: string[], checked: boolean) => void;
};

const syncableStatuses = new Set<AccountingCheckSyncedStatus>([
  'checked',
  'synced',
  'pending',
  'error',
  'resynced',
]);

const getSyncStatus = (
  deal: AccountingCheckSyncedDeal,
): AccountingCheckSyncedStatus => deal.syncStatus || 'skipped';

export const isSyncableAccountingDeal = (deal: AccountingCheckSyncedDeal) =>
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

export const getAccountingCheckSyncedDealsColumns = ({
  toSyncDealIds,
  syncableDealIds,
  onToggleToSync,
  onToggleAllToSync,
}: AccountingCheckSyncedDealsColumnsOptions): ColumnDef<AccountingCheckSyncedDeal>[] => [
  RecordTable.checkboxColumn as ColumnDef<AccountingCheckSyncedDeal>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconLabel} label={t('deal-name')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'number',
    accessorKey: 'number',
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconHash} label={t('deal-number')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('amount')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={stringifyAmount(cell.getValue())} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconCalendarPlus} label={t('created-at')} />;
    },
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
  {
    id: 'syncStatus',
    accessorKey: 'syncStatus',
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconCategory} label={t('sync-status')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || 'skipped'} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'toSync',
    accessorKey: 'toSync',
    header: () => {
      const selectedCount = syncableDealIds.filter(
        (id) => toSyncDealIds[id],
      ).length;
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
      const disabled = !isSyncableAccountingDeal(deal);

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
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconCategory} label={t('synced-date')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'syncedBillNumber',
    accessorKey: 'syncedBillNumber',
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconCategory} label={t('synced-number')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
];
