import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendar,
  IconHash,
  IconLabel,
  IconProgressCheck,
} from '@tabler/icons-react';
import {
  Badge,
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

export const TourColumns = (
  onEdit?: (tourId: string) => void,
): ColumnDef<ITour>[] => [
  RecordTable.checkboxColumn as ColumnDef<ITour>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell, row }: { cell: any; row: any }) => (
      <RecordTableInlineCell>
        <Badge
          variant="ghost"
          className="px-2 py-1 font-medium"
          onClick={() => onEdit?.(row.original._id)}
        >
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
        </Badge>
      </RecordTableInlineCell>
    ),
    size: 240,
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
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconProgressCheck} label="Status" />
    ),
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
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Start Date" />
    ),
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
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="End Date" />
    ),
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={formatDate(cell.getValue() as string)} />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
];
