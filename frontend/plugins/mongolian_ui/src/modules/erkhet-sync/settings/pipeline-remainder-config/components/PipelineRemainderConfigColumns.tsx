import { IconEdit, IconAlignLeft, IconAt, IconLayoutKanban, IconTrash } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Button, Combobox, Command, Popover, RecordTable, RecordTableInlineCell, useConfirm } from 'erxes-ui';
import { checkboxColumn } from 'erxes-ui/modules/record-table/components/CheckboxColumn';
import { useState } from 'react';
import { AddPipelineRemainderConfig } from '../types';
import { TRemainderConfigRow } from '../hooks/usePipelineRemainderConfigs';
import { PipelineRemainderConfigEditSheet } from './PipelineRemainderConfigEditSheet';

const TitleCell = ({
  config,
  onEdit,
  editLoading,
}: {
  config: TRemainderConfigRow;
  onEdit: (id: string, data: AddPipelineRemainderConfig) => Promise<void>;
  editLoading: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RecordTableInlineCell className="cursor-pointer font-medium" onClick={() => setOpen(true)}>
        {config.title || '—'}
      </RecordTableInlineCell>
      {open && (
        <PipelineRemainderConfigEditSheet
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

const MoreCell = ({
  cell,
  onEdit,
  onDelete,
  editLoading,
}: {
  cell: CellContext<TRemainderConfigRow, unknown>;
  onEdit: (id: string, data: AddPipelineRemainderConfig) => Promise<void>;
  onDelete: (id: string) => void;
  editLoading: boolean;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const config = cell.row.original;
  const { confirm } = useConfirm();

  const handleDelete = () => {
    confirm({ message: 'Are you sure you want to delete this config?' }).then(
      () => onDelete(config._id),
    );
  };

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content
          align="start"
          className="w-[180px] min-w-0 [&>button]:cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <Command.List>
              <Command.Item asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8"
                  onClick={() => setEditOpen(true)}
                >
                  <IconEdit className="size-4" />
                  Edit
                </Button>
              </Command.Item>
              <Command.Item asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={editLoading}
                >
                  <IconTrash className="size-4" />
                  Delete
                </Button>
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      {editOpen && (
        <PipelineRemainderConfigEditSheet
          config={config}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSubmit={onEdit}
          loading={editLoading}
        />
      )}
    </>
  );
};

export const buildRemainderConfigColumns = (
  onEdit: (id: string, data: AddPipelineRemainderConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TRemainderConfigRow>[] => [
  {
    id: 'more',
    cell: (cell) => (
      <MoreCell cell={cell} onEdit={onEdit} onDelete={onDelete} editLoading={editLoading} />
    ),
    size: 25,
  },
  checkboxColumn as ColumnDef<TRemainderConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Title" />,
    cell: ({ row }) => (
      <TitleCell config={row.original} onEdit={onEdit} editLoading={editLoading} />
    ),
    size: 200,
  },
  {
    id: 'account',
    accessorKey: 'account',
    header: () => <RecordTable.InlineHead icon={IconAt} label="Account" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{(cell.getValue() as string) || '—'}</RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'location',
    accessorKey: 'location',
    header: () => <RecordTable.InlineHead icon={IconLayoutKanban} label="Location" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{(cell.getValue() as string) || '—'}</RecordTableInlineCell>
    ),
    size: 200,
  },
];
