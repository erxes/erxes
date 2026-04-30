import { IconAlignLeft, IconAt, IconLayoutKanban } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { checkboxColumn } from 'erxes-ui/modules/record-table/components/CheckboxColumn';
import { TErkhetConfig } from '../types';
import { TStageInErkhetConfigRow } from '../hooks/useStageInErkhetConfigs';
import { StageInErkhetConfigEditSheet } from './StageInErkhetConfigEditSheet';
import { ErkhetConfigTitleCell, ErkhetConfigMoreCell } from '../../shared/components/ErkhetConfigColumnCells';

export const buildStageInErkhetConfigColumns = (
  onEdit: (id: string, data: TErkhetConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TStageInErkhetConfigRow>[] => [
  {
    id: 'more',
    cell: (cell: CellContext<TStageInErkhetConfigRow, unknown>) => (
      <ErkhetConfigMoreCell
        cell={cell}
        onDelete={onDelete}
        editLoading={editLoading}
        renderEditSheet={(open, onOpenChange) => (
          <StageInErkhetConfigEditSheet
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
  checkboxColumn as ColumnDef<TStageInErkhetConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Title" />,
    cell: ({ row }) => (
      <ErkhetConfigTitleCell
        config={row.original}
        renderEditSheet={(open, onOpenChange) => (
          <StageInErkhetConfigEditSheet
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
    id: 'chooseResponseField',
    accessorKey: 'chooseResponseField',
    header: () => <RecordTable.InlineHead icon={IconLayoutKanban} label="Response Field" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{(cell.getValue() as string) || '—'}</RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'defaultPay',
    accessorKey: 'defaultPay',
    header: () => <RecordTable.InlineHead icon={IconLayoutKanban} label="Default Pay" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{(cell.getValue() as string) || '—'}</RecordTableInlineCell>
    ),
    size: 150,
  },
];
