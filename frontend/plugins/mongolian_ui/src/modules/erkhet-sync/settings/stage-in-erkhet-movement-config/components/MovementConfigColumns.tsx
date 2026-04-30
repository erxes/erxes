import {
  IconAlignLeft,
  IconAt,
  IconLayoutKanban,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { Button, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';
import { TMovementErkhetConfig } from '../types';
import { MovementConfigEditSheet } from './MovementConfigEditSheet';

type TConfigRow = TMovementErkhetConfig & { _id: string };

const TitleCell = ({
  config,
  onEdit,
  editLoading,
}: {
  config: TConfigRow;
  onEdit: (id: string, data: TMovementErkhetConfig) => Promise<void>;
  editLoading: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RecordTableInlineCell
        className="cursor-pointer font-medium"
        onClick={() => setOpen(true)}
      >
        {config.title || '—'}
      </RecordTableInlineCell>
      {open && (
        <MovementConfigEditSheet
          config={config}
          open={open}
          onOpenChange={setOpen}
          onSubmit={onEdit}
          loading={editLoading}
        />
      )}
    </>
  );
};

export const buildMovementConfigColumns = (
  onEdit: (id: string, data: TMovementErkhetConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TConfigRow>[] => [
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Title" />,
    cell: ({ row }) => (
      <TitleCell
        config={row.original}
        onEdit={onEdit}
        editLoading={editLoading}
      />
    ),
    size: 200,
  },
  {
    id: 'userEmail',
    accessorKey: 'userEmail',
    header: () => <RecordTable.InlineHead icon={IconAt} label="User Email" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '—'}
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'defaultCustomer',
    accessorKey: 'defaultCustomer',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Default Customer" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '—'}
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'chooseResponseField',
    accessorKey: 'chooseResponseField',
    header: () => (
      <RecordTable.InlineHead icon={IconLayoutKanban} label="Response Field" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '—'}
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'delete',
    header: () => <div className="w-10" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original._id)}
        >
          <IconTrash size={16} />
        </Button>
      </RecordTableInlineCell>
    ),
    size: 52,
  },
];
