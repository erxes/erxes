import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendar,
  IconCalendarDot,
  IconCalendarEvent,
  IconCalendarPlus,
  IconHash,
  IconLabel,
  IconListTree,
  IconProgressCheck,
} from '@tabler/icons-react';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ITour } from '../types/tour';
import { ICategory } from '../../category';

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
  categories: ICategory[],
  onEdit?: (tourId: string) => void,
): ColumnDef<ITour>[] => {
  return [
    RecordTable.checkboxColumn as ColumnDef<ITour>,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
      cell: ({ cell, row }: { cell: any; row: any }) => (
        <RecordTableInlineCell>
          <Badge
            variant="secondary"
            className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
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
      id: 'date_status',
      accessorKey: 'date_status',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendarEvent} label="Date status" />
      ),
      cell: ({ cell }: { cell: any }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
        </RecordTableInlineCell>
      ),
      size: 140,
    },
    {
      id: 'categoryIds',
      accessorKey: 'categoryIds',
      header: () => (
        <RecordTable.InlineHead icon={IconListTree} label="Category" />
      ),
      cell: ({ cell }: { cell: any }) => {
        const ids = cell.getValue() as string[] | undefined;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return (
            <RecordTableInlineCell>
              <TextOverflowTooltip value="-" />
            </RecordTableInlineCell>
          );
        }

        const names = ids
          .map((id) => categories.find((c: ICategory) => c._id === id)?.name)
          .filter(Boolean) as string[];

        const displayValue =
          names.length > 0 ? names.join(', ') : `${ids.length} selected`;

        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={displayValue || '-'} />
          </RecordTableInlineCell>
        );
      },
      size: 140,
    },
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Start Date" />
      ),
      cell: ({ row }: { row: any }) => {
        const tour = row.original as ITour;
        const dateValue =
          tour.dateType === 'flexible' ? tour.availableFrom : tour.startDate;
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={formatDate(dateValue)} />
          </RecordTableInlineCell>
        );
      },
      size: 140,
    },
    {
      id: 'endDate',
      accessorKey: 'endDate',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="End Date" />
      ),
      cell: ({ row }: { row: any }) => {
        const tour = row.original as ITour;
        const dateValue =
          tour.dateType === 'flexible' ? tour.availableTo : tour.endDate;
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={formatDate(dateValue)} />
          </RecordTableInlineCell>
        );
      },
      size: 140,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendarPlus} label="Created" />
      ),
      cell: ({ cell }: { cell: any }) => {
        return (
          <RelativeDateDisplay value={cell.getValue() as string} asChild>
            <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
              <RelativeDateDisplay.Value value={cell.getValue() as string} />
            </RecordTableInlineCell>
          </RelativeDateDisplay>
        );
      },
      size: 140,
    },
    {
      id: 'modifiedAt',
      accessorKey: 'modifiedAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendarDot} label="Modified" />
      ),
      cell: ({ cell }: { cell: any }) => {
        return (
          <RelativeDateDisplay value={cell.getValue() as string} asChild>
            <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
              <RelativeDateDisplay.Value value={cell.getValue() as string} />
            </RecordTableInlineCell>
          </RelativeDateDisplay>
        );
      },
      size: 140,
    },
  ];
};
