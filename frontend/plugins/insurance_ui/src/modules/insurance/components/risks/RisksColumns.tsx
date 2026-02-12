import {
  IconAlertTriangle,
  IconFileDescription,
  IconCalendar,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { RiskType } from '~/modules/insurance/types';
import { RisksMoreColumn } from './RisksMoreColumn';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('mn-MN');
};

export const risksColumns: ColumnDef<RiskType>[] = [
  {
    id: 'more',
    accessorKey: 'more',
    header: '',
    cell: ({ cell }) => <RisksMoreColumn cell={cell} />,
    size: 20,
  },
  RecordTable.checkboxColumn as ColumnDef<RiskType>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconAlertTriangle} label="Name" />
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
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFileDescription} label="Description" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
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
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Updated At" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
        </RecordTableInlineCell>
      );
    },
  },
];
