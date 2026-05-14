import { ColumnDef } from '@tanstack/table-core';
import {
  IconCalendarPlus,
  IconClock,
  IconLabel,
  IconCalendarDot,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  RelativeDateDisplay,
  Badge,
} from 'erxes-ui';
import { IItinerary } from '../types/itinerary';
import { itineraryMoreColumn } from './ItineraryMoreCell';

interface ItineraryColumnsProps {
  onEditClick?: (itineraryId: string, branchId?: string) => void;
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const itineraryColumns = (
  props?: ItineraryColumnsProps,
): ColumnDef<IItinerary>[] => [
  RecordTable.checkboxColumn as ColumnDef<IItinerary>,
  itineraryMoreColumn(
    props?.onEditClick,
    props?.branchId,
    props?.branchLanguages,
    props?.mainLanguage,
  ),
  {
    id: 'color',
    accessorKey: 'color',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Color" />,
    cell: ({ cell }: { cell: any }) => {
      const color = (cell.getValue() as string) || '#4F46E5';
      return (
        <RecordTableInlineCell>
          <div
            className="w-4 h-4 rounded-full border border-border"
            style={{ backgroundColor: color }}
          />
        </RecordTableInlineCell>
      );
    },
    size: 60,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell, row }: { cell: any; row: any }) => (
      <RecordTableInlineCell>
        <Badge
          variant="secondary"
          className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
          onClick={() => {
            const itinerary = row.original as IItinerary;
            props?.onEditClick?.(itinerary._id, itinerary.branchId);
          }}
        >
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
        </Badge>
      </RecordTableInlineCell>
    ),
    size: 240,
  },
  {
    id: 'duration',
    accessorKey: 'duration',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label="Duration (days)" />
    ),
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={cell.getValue() ? String(cell.getValue()) : '-'}
        />
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'totalCost',
    accessorKey: 'totalCost',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="Total cost" />
    ),
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
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
    size: 180,
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
    size: 180,
  },
];
