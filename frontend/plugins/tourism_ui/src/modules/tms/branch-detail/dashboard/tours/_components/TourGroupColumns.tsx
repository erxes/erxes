import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendar,
  IconHash,
  IconLabel,
  IconUsers,
} from '@tabler/icons-react';
import {
  Badge,
  Checkbox,
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ITour } from '../types/tour';

export type TourGroupRow = ITour & {
  order: string;
  hasChildren: boolean;
  isGroup: boolean;
  childCount?: number;
  dateRangeLabel?: string;
  statusLabel?: string;
};

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

interface GroupedTourColumnsProps {
  onEdit?: (tourId: string) => void;
}

export const GroupedTourColumns = (
  props?: GroupedTourColumnsProps,
): ColumnDef<TourGroupRow>[] => [
  {
    id: 'checkbox',
    header: ({ table }) => {
      const selectableRows = table
        .getRowModel()
        .rows.filter((row) => !row.original.isGroup);
      const selectedSelectableRows = selectableRows.filter((row) =>
        row.getIsSelected(),
      );
      const isAllSelected =
        selectableRows.length > 0 &&
        selectedSelectableRows.length === selectableRows.length;
      const isSomeSelected =
        selectedSelectableRows.length > 0 &&
        selectedSelectableRows.length < selectableRows.length;

      return (
        <div className="flex justify-center items-center h-8">
          <Checkbox
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            onCheckedChange={(value) =>
              selectableRows.forEach((row) => row.toggleSelected(!!value))
            }
            aria-label="Select all tours"
          />
        </div>
      );
    },
    size: 33,
    cell: ({ row }) => {
      if (row.original.isGroup) {
        return <div className="flex justify-center items-center" />;
      }

      return (
        <div className="flex justify-center items-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        </div>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell, row }) => {
      const value = cell.getValue() as string;

      return (
        <RecordTableInlineCell>
          <RecordTableTree.Trigger
            order={row.original.order}
            name={value || row.original._id}
            hasChildren={row.original.hasChildren}
          >
            <div className="min-w-0">
              {row.original.isGroup ? (
                <TextOverflowTooltip value={row.original._id} />
              ) : (
                <Badge
                  variant="secondary"
                  className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
                  onClick={() => props?.onEdit?.(row.original._id)}
                >
                  <TextOverflowTooltip value={value || '-'} />
                </Badge>
              )}
            </div>
          </RecordTableTree.Trigger>
        </RecordTableInlineCell>
      );
    },
    size: 320,
  },
  {
    id: 'refNumber',
    accessorKey: 'refNumber',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Ref" />,
    cell: ({ cell, row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            row.original.isGroup ? '-' : (cell.getValue() as string) || '-'
          }
        />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'date',
    accessorKey: 'dateRangeLabel',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    cell: ({ row }) => {
      if (row.original.isGroup) {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={row.original.dateRangeLabel || '-'} />
          </RecordTableInlineCell>
        );
      }

      const tour = row.original;
      const startDateValue =
        tour.dateType === 'flexible' ? tour.availableFrom : tour.startDate;
      const endDateValue =
        tour.dateType === 'flexible' ? tour.availableTo : tour.endDate;

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={`${formatDate(startDateValue)} - ${formatDate(
              endDateValue,
            )}`}
          />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'status',
    accessorKey: 'statusLabel',
    header: () => <RecordTable.InlineHead icon={IconUsers} label="Status" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            row.original.isGroup
              ? row.original.statusLabel || '-'
              : `${row.original.status || '-'} / ${
                  row.original.date_status || '-'
                }`
          }
        />
      </RecordTableInlineCell>
    ),
    size: 180,
  },
];
