import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconPhone,
  IconTrash,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { Cell } from '@tanstack/react-table';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Button,
  useConfirm,
} from 'erxes-ui';

import { ICovers } from '@/pos/pos-covers/types/posCover';
import { coverMoreColumn } from '@/pos/pos-covers/components/CoversMoreColumns';

const ActionsCell = ({ cell }: { cell: Cell<ICovers, unknown> }) => {
  const { confirm } = useConfirm();
  const { _id } = cell.row.original;

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this cover?',
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      // Delete cover logic here
    });
  };

  return (
    <RecordTableInlineCell>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <IconTrash className="w-4 h-4" />
        <p className="text-xs font-medium text-black">Delete</p>
      </Button>
    </RecordTableInlineCell>
  );
};

export const coverColumns: ColumnDef<ICovers>[] = [
  coverMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICovers>,
  {
    id: 'beginDate',
    accessorKey: 'beginDate',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Begin Date" />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value
              value={(cell.getValue() as string) || 'Invalid Date'}
            />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => (
      <RecordTable.InlineHead icon={IconMobiledata} label="End Date" />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'pos',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconPhone} label="Pos" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'user.email',
    accessorKey: 'createdBy',
    header: () => <RecordTable.InlineHead icon={IconBuilding} label="User" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="Actions" />
    ),
    cell: ActionsCell,
  },
];
