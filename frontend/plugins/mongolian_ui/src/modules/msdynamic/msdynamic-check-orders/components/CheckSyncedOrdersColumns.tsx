import dayjs from 'dayjs';
import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendar,
  IconCash,
  IconHash,
  IconLabel,
} from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import {
  IMSDynamicCheckOrder,
  ISyncedOrderInfo,
} from '../types/msDynamicCheckOrder';
import { getCheckSyncedOrdersMoreColumn } from './CheckSyncedOrdersMoreColumn';

const ORDER_DETAIL_ID_KEY = 'orderDetailId';

type CheckSyncedOrdersColumnsOptions = {
  syncedOrderInfos: Record<string, ISyncedOrderInfo>;
  onResend: (orderId: string) => void;
};

const CheckSyncedOrderDateRow = ({
  value,
  id,
  order,
}: {
  value: string | null | undefined;
  id: string;
  order: IMSDynamicCheckOrder;
}) => {
  const [, setOrderDetailId] = useQueryState<string>(ORDER_DETAIL_ID_KEY);
  return (
    <>
      <RelativeDateDisplay value={value || ''} asChild>
        <RecordTableInlineCell
          className="text-xs font-medium text-muted-foreground"
          onClick={() => {
            if (id === 'createdAt') {
              setOrderDetailId(order._id);
            }
          }}
        >
          <RelativeDateDisplay.Value value={value || ''} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    </>
  );
};

export const getCheckSyncedOrdersColumns = ({
  syncedOrderInfos,
  onResend,
}: CheckSyncedOrdersColumnsOptions): ColumnDef<IMSDynamicCheckOrder>[] => [
  getCheckSyncedOrdersMoreColumn({ onResend }),
  RecordTable.checkboxColumn as ColumnDef<IMSDynamicCheckOrder>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Number" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconCash} label="Total Amount" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Created At" />
    ),
    cell: ({ cell, row }) => (
      <CheckSyncedOrderDateRow
        value={cell.getValue() as string}
        id="createdAt"
        order={row.original}
      />
    ),
  },
  {
    id: 'paidDate',
    accessorKey: 'paidDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Paid At" />
    ),
    cell: ({ cell, row }) => (
      <CheckSyncedOrderDateRow
        value={cell.getValue() as string}
        id="paidDate"
        order={row.original}
      />
    ),
  },
  {
    id: 'syncedDate',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Synced Date" />
    ),
    cell: ({ row }) => {
      const syncedInfo = syncedOrderInfos[row.original._id];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={
              syncedInfo?.syncedDate
                ? dayjs(syncedInfo.syncedDate).format('LL')
                : ''
            }
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'syncedBillNumber',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Synced bill Number" />
    ),
    cell: ({ row }) => {
      const syncedInfo = syncedOrderInfos[row.original._id];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={syncedInfo?.syncedBillNumber || ''} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'syncedCustomer',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Synced customer" />
    ),
    cell: ({ row }) => {
      const syncedInfo = syncedOrderInfos[row.original._id];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={syncedInfo?.syncedCustomer || ''} />
        </RecordTableInlineCell>
      );
    },
  },
];
