import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconPhone,
  IconClock,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';

import { IPosSummary } from '@/pos/pos-summary/types/posSummary';

interface PaymentRow {
  original: IPosSummary;
}

type PaymentSummary = Record<string, number | undefined>;

export const generateOtherPaymentColumns = (summary?: PaymentSummary) => {
  const otherPayTitles = (summary ? Object.keys(summary) || [] : [])
    .filter((a) => !['count', 'cashAmount', 'mobileAmount'].includes(a))
    .sort((a, b) => a.localeCompare(b));

  return otherPayTitles.map((title: string, index) => ({
    id: `${title}_${index}`,
    header: () => <RecordTable.InlineHead icon={IconClock} label={title} />,
    cell: ({ row }: { row: PaymentRow }) => {
      const order = row.original;
      const dynamicAmounts = order.amounts as Record<
        string,
        number | undefined
      >;
      const value = dynamicAmounts[title] || 0;

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  }));
};
export const firstPosSummaryColumns: ColumnDef<IPosSummary>[] = [
  {
    id: 'paidDate',
    accessorKey: 'paidDate',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Group" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'count',
    accessorKey: 'amounts.count',
    header: () => (
      <RecordTable.InlineHead icon={IconMobiledata} label="Count" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={typeof value === 'number' ? value.toLocaleString() : '0'}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'amounts.cashAmount',
    accessorKey: 'amounts.cashAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconPhone} label="Cash Amount" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={typeof value === 'number' ? value.toLocaleString() : '0'}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'amounts.mobileAmount',
    accessorKey: 'amounts.mobileAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label="Mobile Amount" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={typeof value === 'number' ? value.toLocaleString() : '0'}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
export const secondPosSummaryColumns: ColumnDef<IPosSummary>[] = [
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <RecordTable.InlineHead icon={IconChartBar} label="Amount" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={typeof value === 'number' ? value.toLocaleString() : '0'}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
