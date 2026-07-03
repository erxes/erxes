import {
  IconLabel,
  IconMobiledata,
  IconClock,
  IconUser,
  IconTag,
  IconFileText,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Badge,
} from 'erxes-ui';

import { IOrder } from '@/pos/types/order';

import type { TFunction } from 'i18next';
import { IUser } from 'ui-modules/modules';
import { ordersMoreColumn } from '@/pos/orders/components/OrdersMoreColumn';
import { ClickableBillNumber } from './ClickableBillNumber';

interface PaymentSummary {
  [key: string]: number | string;
}

interface PaymentRow {
  original: IOrder;
}

// posOrdersSummary keys are payment titles (e.g. 'Invoice', 'QPay')
// paidAmounts items: { type, amount, title } — title may be missing on old data
// Build two maps: by title AND by type, merge both for lookup
interface IPaidAmount {
  type?: string;
  amount?: number;
  title?: string;
}

const getPaidAmountsMap = (
  paidAmounts: IPaidAmount[] | null | undefined,
): Record<string, number> => {
  if (!paidAmounts || !Array.isArray(paidAmounts)) return {};

  return paidAmounts.reduce<Record<string, number>>((acc, item) => {
    const amount = Number(item?.amount || 0);
    if (item?.title) acc[item.title] = (acc[item.title] || 0) + amount;
    if (item?.type) acc[item.type] = (acc[item.type] || 0) + amount;
    return acc;
  }, {});
};

export const generateOtherPaymentColumns = (summary?: PaymentSummary) => {
  const otherPayTitles = (summary ? Object.keys(summary) : [])
    .filter(
      (a) =>
        !['_id', 'count', 'cashAmount', 'mobileAmount', 'totalAmount'].includes(
          a,
        ),
    )
    .sort();

  return otherPayTitles.map((title: string, index) => ({
    id: `${title}_${index}`,
    header: () => <RecordTable.InlineHead icon={IconClock} label={title} />,
    cell: ({ row }: { row: PaymentRow }) => {
      const order = row.original;
      const dynamicAmounts = getPaidAmountsMap(order.paidAmounts);
      const value = dynamicAmounts[title] || 0;

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value ? value.toLocaleString() : ''} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  }));
};

export const firstOrderColumns = (t: TFunction): ColumnDef<IOrder>[] => [
  ordersMoreColumn,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('bill-number')} />
    ),
    cell: ({ cell, row }) => (
      <ClickableBillNumber value={cell.getValue() as string} row={row} />
    ),
  },
  {
    id: 'paidDate',
    accessorKey: 'paidDate',
    header: () => (
      <RecordTable.InlineHead icon={IconMobiledata} label={t('date')} />
    ),
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.paidDate
        ? new Date(rowA.original.paidDate)
        : new Date(0);
      const dateB = rowB.original.paidDate
        ? new Date(rowB.original.paidDate)
        : new Date(0);
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    id: 'cashAmount',
    accessorKey: 'cashAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('cash-amount')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={(cell.getValue() as number)?.toLocaleString()}
        />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'mobileAmount',
    accessorKey: 'mobileAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('mobile-amount')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={(cell.getValue() as number)?.toLocaleString()}
        />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
];

export const secondOrderColumns = (t: TFunction): ColumnDef<IOrder>[] => [
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('amount')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={(cell.getValue() as number)?.toLocaleString()}
        />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'customerType',
    accessorKey: 'customerType',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label={t('customer')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'posName',
    accessorKey: 'posName',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('pos')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('type')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="default">{cell.getValue() as string}</Badge>
      </RecordTableInlineCell>
    ),
    size: 100,
  },
  {
    id: 'user',
    accessorKey: 'user',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('user')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={(cell.getValue() as IUser)?.username || ''}
        />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFileText} label={t('description')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
];
