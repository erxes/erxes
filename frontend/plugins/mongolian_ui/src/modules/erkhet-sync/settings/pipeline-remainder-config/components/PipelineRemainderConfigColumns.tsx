import { IconAlignLeft, IconAt, IconLayoutKanban } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { checkboxColumn } from 'erxes-ui/modules/record-table/components/CheckboxColumn';
import { AddPipelineRemainderConfig } from '../types';
import { TRemainderConfigRow } from '../hooks/usePipelineRemainderConfigs';
import { PipelineRemainderConfigEditSheet } from './PipelineRemainderConfigEditSheet';
import { ErkhetConfigTitleCell, ErkhetConfigMoreCell } from '../../shared/components/ErkhetConfigColumnCells';

export const buildRemainderConfigColumns = (
  onEdit: (id: string, data: AddPipelineRemainderConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TRemainderConfigRow>[] => [
  {
    id: 'more',
    cell: (cell: CellContext<TRemainderConfigRow, unknown>) => (
      <ErkhetConfigMoreCell
        cell={cell}
        onDelete={onDelete}
        editLoading={editLoading}
        renderEditSheet={(open, onOpenChange) => (
          <PipelineRemainderConfigEditSheet
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
  checkboxColumn as ColumnDef<TRemainderConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Title" />,
    cell: ({ row }) => (
      <ErkhetConfigTitleCell
        config={row.original}
        renderEditSheet={(open, onOpenChange) => (
          <PipelineRemainderConfigEditSheet
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
