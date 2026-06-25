import {
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconClock,
  IconCalendarPlus,
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
  CheckPosOrderStatus,
  ICheckPosOrders,
} from '../types/checkPosOrders';
import { CheckPosOrdersMoreColumn } from './CheckPosOrdersMoreColumn';

type CheckPosOrdersColumnsOptions = {
  toSyncOrderIds: Record<string, boolean>;
  syncableOrderIds: string[];
  onToggleToSync: (id: string, checked: boolean) => void;
  onToggleAllToSync: (ids: string[], checked: boolean) => void;
  t: (key: string) => string;
};

const syncableStatuses = new Set<CheckPosOrderStatus>([
  'checked',
  'synced',
  'pending',
  'error',
  'resynced',
]);

const getSyncStatus = (order: ICheckPosOrders): CheckPosOrderStatus =>
  order.syncStatus || 'skipped';

export const isSyncableOrder = (order: ICheckPosOrders) =>
  syncableStatuses.has(getSyncStatus(order));

export const getCheckPosOrdersColumns = ({
  toSyncOrderIds,
  syncableOrderIds,
  onToggleToSync,
  onToggleAllToSync,
  t,
}: CheckPosOrdersColumnsOptions): ColumnDef<ICheckPosOrders>[] => [
  CheckPosOrdersMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICheckPosOrders>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('number')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconHash} label={t('total-amount')} />
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
    id: 'paidDate',
    accessorKey: 'paidDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('paid-at')} />
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
      <RecordTable.InlineHead icon={IconClock} label={t('sync-status')} />
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
      const selectedCount = syncableOrderIds.filter((id) => toSyncOrderIds[id])
        .length;
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
      const disabled = !isSyncableOrder(order);

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
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label={t('synced-date')} />
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
      <RecordTable.InlineHead icon={IconClock} label={t('synced-bill')} />
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
      <RecordTable.InlineHead icon={IconClock} label={t('synced-customer')} />
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
