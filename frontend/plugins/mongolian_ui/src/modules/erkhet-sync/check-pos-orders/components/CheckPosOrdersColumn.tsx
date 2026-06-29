import { IconCurrencyDollar, IconHash, IconLabel, IconClock, IconCalendarPlus } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Checkbox,
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { CheckPosOrderStatus, ICheckPosOrders } from '../types/checkPosOrders';
import { useCheckPosOrders, toSyncOrderIdsAtom } from '../hooks/useCheckPosOrders';
import { HeaderCell } from '../../components/HeaderCell';

const ToSyncOrderHeader = () => {
  const { t } = useTranslation('mongolian');
  const [toSyncOrderIds] = useAtom(toSyncOrderIdsAtom);
  const { checkPosOrders, setAllOrdersToSync } = useCheckPosOrders();
  const syncableOrderIds = (checkPosOrders || []).filter(isSyncableOrder).map((o) => o._id);
  const selectedCount = syncableOrderIds.filter((id) => toSyncOrderIds[id]).length;
  const isAllSelected = syncableOrderIds.length > 0 && selectedCount === syncableOrderIds.length;
  const isSomeSelected = selectedCount > 0 && !isAllSelected;
  const nextChecked = !(isAllSelected || isSomeSelected);

  return (
    <div className="relative z-20 flex items-center justify-center h-8">
      <Checkbox
        key={`${syncableOrderIds.length}-${selectedCount}`}
        checked={isAllSelected || (isSomeSelected && 'indeterminate')}
        disabled={!syncableOrderIds.length}
        onCheckedChange={() => setAllOrdersToSync(syncableOrderIds, nextChecked)}
        aria-label={t('select-all-orders-to-sync')}
      />
    </div>
  );
};

const ToSyncOrderCell = ({ order }: { order: ICheckPosOrders }) => {
  const { t } = useTranslation('mongolian');
  const [toSyncOrderIds] = useAtom(toSyncOrderIdsAtom);
  const { setOrderToSync } = useCheckPosOrders();
  const disabled = !isSyncableOrder(order);

  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={!disabled && Boolean(toSyncOrderIds[order._id])}
        disabled={disabled}
        onCheckedChange={(value) => setOrderToSync(order._id, Boolean(value))}
        aria-label={t('select-order-to-sync')}
      />
    </div>
  );
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
    header: () => <ToSyncOrderHeader />,
    size: 33,
    cell: ({ row }) => <ToSyncOrderCell order={row.original} />,
  },
  {
    id: 'syncedDate',
    accessorKey: 'syncedDate',
    header: () => <HeaderCell icon={IconClock} label="synced-date" />,
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
    header: () => <HeaderCell icon={IconClock} label="synced-bill" />,
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
    header: () => <HeaderCell icon={IconClock} label="synced-customer" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
