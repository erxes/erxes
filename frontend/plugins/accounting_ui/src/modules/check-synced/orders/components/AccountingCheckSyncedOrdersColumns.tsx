import {
  IconCalendarPlus,
  IconCategory,
  IconCurrencyDollar,
  IconHash,
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
  AccountingCheckSyncedOrder,
  AccountingCheckSyncedStatus,
} from '../types';

type AccountingCheckSyncedOrdersColumnsOptions = {
  toSyncOrderIds: Record<string, boolean>;
  syncableOrderIds: string[];
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
  order: AccountingCheckSyncedOrder,
): AccountingCheckSyncedStatus => order.syncStatus || 'skipped';

export const isSyncableAccountingOrder = (order: AccountingCheckSyncedOrder) =>
  syncableStatuses.has(getSyncStatus(order));

export const getAccountingCheckSyncedOrdersColumns = ({
  toSyncOrderIds,
  syncableOrderIds,
  onToggleToSync,
  onToggleAllToSync,
}: AccountingCheckSyncedOrdersColumnsOptions): ColumnDef<AccountingCheckSyncedOrder>[] => [
  RecordTable.checkboxColumn as ColumnDef<AccountingCheckSyncedOrder>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconHash} label={t('order-number')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => {
      const { t } = useTranslation('accounting');
      return <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('amount')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() || '')} />
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
      const selectedCount = syncableOrderIds.filter(
        (id) => toSyncOrderIds[id],
      ).length;
      const isAllSelected =
        syncableOrderIds.length > 0 &&
        selectedCount === syncableOrderIds.length;
      const isSomeSelected = selectedCount > 0 && !isAllSelected;
      const nextChecked = !(isAllSelected || isSomeSelected);

      return (
        <div className="relative z-20 flex items-center justify-center h-8">
          <Checkbox
            key={`${syncableOrderIds.length}-${selectedCount}`}
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            disabled={!syncableOrderIds.length}
            onCheckedChange={() =>
              onToggleAllToSync(syncableOrderIds, nextChecked)
            }
            aria-label="Select all orders to sync"
          />
        </div>
      );
    },
    size: 33,
    cell: ({ row }) => {
      const order = row.original;
      const disabled = !isSyncableAccountingOrder(order);

      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={!disabled && Boolean(toSyncOrderIds[order._id])}
            disabled={disabled}
            onCheckedChange={(value) =>
              onToggleToSync(order._id, Boolean(value))
            }
            aria-label="Select order to sync"
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
];
