import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconPhone,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { IPosOrdersBySubs } from '@/pos/pos-order-by-subsription/types/PosOrderBySubs';
import { PosOrderBySubsMoreColumn } from '@/pos/pos-order-by-subsription/components/PosOrderBySubsMoreColumn';
import { TFunction } from 'i18next';

export const PosOrdersBySubsColumns: (
  t: TFunction,
) => ColumnDef<IPosOrdersBySubs>[] = (t) => [
  PosOrderBySubsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPosOrdersBySubs>,
  {
    id: 'group',
    accessorKey: 'group',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('group')} />
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
    id: 'count',
    accessorKey: 'count',
    header: () => (
      <RecordTable.InlineHead icon={IconMobiledata} label={t('count')} />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'cashAmount',
    accessorKey: 'cashAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconPhone} label={t('cash-amount')} />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'mobileAmount',
    accessorKey: 'mobileAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label={t('mobile-amount')} />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label={t('amount')} />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
  },
];
