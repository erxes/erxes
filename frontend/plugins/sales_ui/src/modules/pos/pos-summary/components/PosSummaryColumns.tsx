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

import { IPosSummary } from '@/pos/pos-summary/types/posSummary';
import { PosSummaryMoreColumn } from '@/pos/pos-summary/components/PosSummaryMoreColumn';

export const PosSummaryColumns: ColumnDef<IPosSummary>[] = [
  PosSummaryMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPosSummary>,
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
    id: 'amounts.count',
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
  {
    id: 'amounts.invoice',
    accessorKey: 'amounts.invoice',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="Invoice" />
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
    id: 'amounts.loyalty',
    accessorKey: 'amounts.loyalty',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="Loyalty" />
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
