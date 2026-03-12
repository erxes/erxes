import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendar,
  IconClock,
  IconLabel,
  IconPalette,
} from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IItinerary } from '../types/itinerary';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
};

export const itineraryColumns = (): ColumnDef<IItinerary>[] => [
  RecordTable.checkboxColumn as ColumnDef<IItinerary>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
    size: 240,
  },
  {
    id: 'duration',
    accessorKey: 'duration',
    header: () => <RecordTable.InlineHead icon={IconClock} label="Duration (days)" />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() ? String(cell.getValue()) : '-'} />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'color',
    accessorKey: 'color',
    header: () => <RecordTable.InlineHead icon={IconPalette} label="Color" />,
    cell: ({ cell }: { cell: any }) => {
      const color = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <div className="flex items-center gap-2">
            {color && (
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: color }}
              />
            )}
            <TextOverflowTooltip value={color || '-'} />
          </div>
        </RecordTableInlineCell>
      );
    },
    size: 140,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Created" />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={formatDate(cell.getValue() as string)} />
      </RecordTableInlineCell>
    ),
    size: 180,
  },
];
