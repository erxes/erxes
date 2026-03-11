import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendar,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconUsers,
} from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ITour } from '../types/tour';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
};

export const tourColumns = (): ColumnDef<ITour>[] => [
  RecordTable.checkboxColumn as ColumnDef<ITour>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
    size: 260,
  },
  {
    id: 'refNumber',
    accessorKey: 'refNumber',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Ref" />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'groupCode',
    accessorKey: 'groupCode',
    header: () => <RecordTable.InlineHead icon={IconUsers} label="Group" />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Start" />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={formatDate(cell.getValue() as string)} />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="End" />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={formatDate(cell.getValue() as string)} />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'cost',
    accessorKey: 'cost',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="Cost" />
    ),
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            cell.getValue() === undefined || cell.getValue() === null
              ? '-'
              : String(cell.getValue())
          }
        />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
];
