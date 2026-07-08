import {
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconClock,
  IconCalendarPlus,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';

import { CheckPosOrderStatus, ICheckPosOrders } from '../types/checkPosOrders';
import { toSyncOrderIdsAtom } from '../hooks/useCheckPosOrders';
import { HeaderCell } from '../../components/HeaderCell';
import {
  ToSyncHeaderCell,
  ToSyncCell,
} from '../../shared/components/ToSyncColumnComponents';
import { syncedInfoColumn } from '../../shared/components/SyncedInfoColumns';

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

export const checkPosOrdersColumns: ColumnDef<ICheckPosOrders>[] = [
  RecordTable.checkboxColumn as ColumnDef<ICheckPosOrders>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <HeaderCell icon={IconLabel} label="number" />,
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
    header: () => <HeaderCell icon={IconHash} label="total-amount" />,
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
    header: () => <HeaderCell icon={IconCalendarPlus} label="created-at" />,
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
    header: () => <HeaderCell icon={IconCurrencyDollar} label="paid-at" />,
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
    header: () => <HeaderCell icon={IconClock} label="sync-status" />,
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
    header: () => (
      <ToSyncHeaderCell
        toSyncIdsAtom={toSyncOrderIdsAtom}
        isSyncable={isSyncableOrder}
        ariaLabel="select-all-orders-to-sync"
      />
    ),
    size: 33,
    cell: ({ row }) => (
      <ToSyncCell
        toSyncIdsAtom={toSyncOrderIdsAtom}
        isSyncable={isSyncableOrder}
        item={row.original}
        ariaLabel="select-order-to-sync"
      />
    ),
  },
  syncedInfoColumn('syncedDate', 'synced-date'),
  syncedInfoColumn('syncedBillNumber', 'synced-bill'),
  syncedInfoColumn('syncedCustomer', 'synced-customer'),
];
