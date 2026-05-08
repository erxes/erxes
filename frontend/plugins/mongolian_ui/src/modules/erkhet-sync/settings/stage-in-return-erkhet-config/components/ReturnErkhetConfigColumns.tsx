import { IconAlignLeft, IconAt, IconLayoutKanban } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { checkboxColumn } from 'erxes-ui/modules/record-table/components/CheckboxColumn';
import { TReturnErkhetConfig } from '../types';
import { TReturnErkhetConfigRow } from '../hooks/useReturnErkhetConfigs';
import { RETURN_TYPES } from '../constants/returnTypesData';
import { ReturnErkhetConfigEditSheet } from './ReturnErkhetConfigEditSheet';
import { ErkhetConfigTitleCell, ErkhetConfigMoreCell } from '../../shared/components/ErkhetConfigColumnCells';

const returnTypeLabel = (value: string) =>
  RETURN_TYPES.find((t) => t.value === value)?.label ?? (value || '—');

export const buildReturnErkhetConfigColumns = (
  onEdit: (id: string, data: TReturnErkhetConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TReturnErkhetConfigRow>[] => [
  {
    id: 'more',
    cell: (cell: CellContext<TReturnErkhetConfigRow, unknown>) => (
      <ErkhetConfigMoreCell
        cell={cell}
        onDelete={onDelete}
        editLoading={editLoading}
        renderEditSheet={(open, onOpenChange) => (
          <ReturnErkhetConfigEditSheet
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
  checkboxColumn as ColumnDef<TReturnErkhetConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Title" />,
    cell: ({ row }) => (
      <ErkhetConfigTitleCell
        config={row.original}
        renderEditSheet={(open, onOpenChange) => (
          <ReturnErkhetConfigEditSheet
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
    id: 'returnType',
    accessorKey: 'returnType',
    header: () => <RecordTable.InlineHead icon={IconLayoutKanban} label="Return Type" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{returnTypeLabel(cell.getValue() as string)}</RecordTableInlineCell>
    ),
    size: 200,
  },
];
