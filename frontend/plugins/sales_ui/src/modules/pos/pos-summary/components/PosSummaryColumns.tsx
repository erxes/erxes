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

import { useTranslation } from 'react-i18next';
import { IPosSummary } from '@/pos/pos-summary/types/posSummary';

interface PaymentRow {
  original: IPosSummary;
}

type PaymentSummary = Record<string, number | undefined>;

export const generateOtherPaymentColumns = (
  summary?: PaymentSummary,
  columnLabels?: Record<string, string>,
) => {
  const otherPayTitles = (summary ? Object.keys(summary) || [] : [])
    .filter((a) => !['count', 'cashAmount', 'mobileAmount'].includes(a))
    .sort((a, b) => a.localeCompare(b));

  return otherPayTitles.map((title: string, index) => ({
    id: `${title}_${index}`,
    header: () => (
      <RecordTable.InlineHead
        icon={IconClock}
        label={columnLabels?.[title] || title}
      />
    ),
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
    size: 155,
  }));
};
export const firstPosSummaryColumns: ColumnDef<IPosSummary>[] = [
  {
    id: 'paidDate',
    accessorKey: 'paidDate',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('group')} />;
    },
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={value && value !== 'undefined' ? value : '-'}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'count',
    accessorKey: 'amounts.count',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconMobiledata} label={t('count')} />;
    },
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
    size: 100,
  },
  {
    id: 'amounts.cashAmount',
    accessorKey: 'amounts.cashAmount',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconPhone} label={t('cash-amount')} />;
    },
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
    size: 130,
  },
  {
    id: 'amounts.mobileAmount',
    accessorKey: 'amounts.mobileAmount',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconBuilding} label={t('mobile-amount')} />;
    },
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
    size: 130,
  },
];
export const secondPosSummaryColumns: ColumnDef<IPosSummary>[] = [
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconChartBar} label={t('amount')} />;
    },
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
    size: 130,
  },
];
