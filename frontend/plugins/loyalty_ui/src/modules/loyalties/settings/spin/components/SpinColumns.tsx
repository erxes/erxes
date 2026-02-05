import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { ISpin } from '../types/spinTypes';
import { SpinNameCell } from '../spin-detail/components/SpinNameCell';
import {
  IconCalendar,
  IconCalendarEvent,
  IconDots,
  IconHash,
  IconSettings,
  IconTag,
} from '@tabler/icons-react';

const SafeRelativeDate = ({ value }: { value?: string }) => {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <RelativeDateDisplay value={value} asChild>
        <RelativeDateDisplay.Value value={value} />
      </RelativeDateDisplay>
    );
  } catch {
    return <span className="text-muted-foreground">-</span>;
  }
};

export const spinColumns: (
  editStatus: (options: any) => void,
) => ColumnDef<ISpin>[] = (editStatus) => [
  RecordTable.checkboxColumn as ColumnDef<ISpin>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Title" />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <SpinNameCell
          spin={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Start Date" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <SafeRelativeDate value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarEvent} label="End Date" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <SafeRelativeDate value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="status" icon={IconHash} />,
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge
            variant={status === 'active' ? 'success' : 'secondary'}
            className="uppercase"
          >
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },

  {
    id: 'action',
    accessorKey: 'action',
    header: () => (
      <RecordTable.InlineHead icon={IconSettings} label="Actions" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <Button className="mx-auto" variant="ghost" size="sm">
            <IconDots className="h-4 w-4" />
          </Button>
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
];
