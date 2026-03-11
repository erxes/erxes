import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendar,
  IconHash,
  IconLabel,
  IconUsers,
} from '@tabler/icons-react';
import {
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

export const groupedTourColumns = (): ColumnDef<TourGroupRow>[] => [
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
              <TextOverflowTooltip
                value={row.original.isGroup ? row.original._id : value || '-'}
              />
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
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            row.original.isGroup
              ? row.original.dateRangeLabel || '-'
              : `${formatDate(row.original.startDate)} - ${formatDate(
                row.original.endDate,
              )}`
          }
        />
      </RecordTableInlineCell>
    ),
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
              : `${row.original.status || '-'} / ${row.original.date_status || '-'
              }`
          }
        />
      </RecordTableInlineCell>
    ),
    size: 180,
  },
];
