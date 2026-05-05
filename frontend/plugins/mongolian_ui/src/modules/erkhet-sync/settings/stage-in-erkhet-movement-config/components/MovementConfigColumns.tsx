import { IconAlignLeft, IconAt, IconLayoutKanban, IconUser } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { checkboxColumn } from 'erxes-ui/modules/record-table/components/CheckboxColumn';
import { TMovementErkhetConfig } from '../types';
import { MovementConfigEditSheet } from './MovementConfigEditSheet';
import { ErkhetConfigTitleCell, ErkhetConfigMoreCell } from '../../shared/components/ErkhetConfigColumnCells';

type TConfigRow = TMovementErkhetConfig & { _id: string };

export const buildMovementConfigColumns = (
  onEdit: (id: string, data: TMovementErkhetConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TConfigRow>[] => [
  {
    id: 'more',
    cell: (cell: CellContext<TConfigRow, unknown>) => (
      <ErkhetConfigMoreCell
        cell={cell}
        onDelete={onDelete}
        editLoading={editLoading}
        renderEditSheet={(open, onOpenChange) => (
          <MovementConfigEditSheet
            config={cell.row.original}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={onEdit}
            loading={editLoading}
          />
        )}
      />
    ),
    size: 25,
  },
  checkboxColumn as ColumnDef<TConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Title" />,
    cell: ({ row }) => (
      <ErkhetConfigTitleCell
        config={row.original}
        renderEditSheet={(open, onOpenChange) => (
          <MovementConfigEditSheet
            config={row.original}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={onEdit}
            loading={editLoading}
          />
        )}
      />
    ),
    size: 200,
  },
  {
    id: 'userEmail',
    accessorKey: 'userEmail',
    header: () => <RecordTable.InlineHead icon={IconAt} label="User Email" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{(cell.getValue() as string) || '—'}</RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'defaultCustomer',
    accessorKey: 'defaultCustomer',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Default Customer" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{(cell.getValue() as string) || '—'}</RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'chooseResponseField',
    accessorKey: 'chooseResponseField',
    header: () => <RecordTable.InlineHead icon={IconLayoutKanban} label="Response Field" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{(cell.getValue() as string) || '—'}</RecordTableInlineCell>
    ),
    size: 160,
  },
];
