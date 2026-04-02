import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconCategory,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';

import { IPosByItems } from '@/pos/pos-by-items/types/PosByItemType';

export const PosByItemsColumns: ColumnDef<IPosByItems>[] = [
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Code" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 60,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 220,
  },
  {
    id: 'category',
    accessorKey: 'category.name',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label="Category" />
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
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead icon={IconMobiledata} label="Unit Price" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={`${cell.getValue() as string}`} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'count_before_10',
    accessorKey: 'counts.0',
    header: () => <RecordTable.InlineHead label="<10" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_10',
    accessorKey: 'counts.1',
    header: () => <RecordTable.InlineHead label="10" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_11',
    accessorKey: 'counts.2',
    header: () => <RecordTable.InlineHead label="11" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_12',
    accessorKey: 'counts.3',
    header: () => <RecordTable.InlineHead label="12" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_13',
    accessorKey: 'counts.4',
    header: () => <RecordTable.InlineHead label="13" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_14',
    accessorKey: 'counts.5',
    header: () => <RecordTable.InlineHead label="14" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_15',
    accessorKey: 'counts.6',
    header: () => <RecordTable.InlineHead label="15" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_16',
    accessorKey: 'counts.7',
    header: () => <RecordTable.InlineHead label="16" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_17',
    accessorKey: 'counts.8',
    header: () => <RecordTable.InlineHead label="17" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_18',
    accessorKey: 'counts.9',
    header: () => <RecordTable.InlineHead label="18" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_19',
    accessorKey: 'counts.10',
    header: () => <RecordTable.InlineHead label="19" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_20',
    accessorKey: 'counts.11',
    header: () => <RecordTable.InlineHead label="20" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_21',
    accessorKey: 'counts.12',
    header: () => <RecordTable.InlineHead label="21" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count_after_21',
    accessorKey: 'counts.13',
    header: () => <RecordTable.InlineHead label="21<" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'count',
    accessorKey: 'count',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="POS Sale" />
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
    id: 'amount',
    accessorKey: 'amount',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label="POS Amount" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={`${cell.getValue() as string}`} />
        </RecordTableInlineCell>
      );
    },
  },
];
