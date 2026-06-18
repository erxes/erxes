import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { BoardSelect, PipelineSelect, StageSelect } from 'ui-modules';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { IConfig } from '../types/Config';
import { syncBaseColumns, SyncConfigTable } from './SyncTableShared';

export const columns: ColumnDef<IConfig>[] = [
  ...syncBaseColumns,
  {
    id: 'board',
    accessorKey: 'board',
    header: () => <RecordTable.InlineHead label="Board" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <BoardSelect boardId={cell.row.original.value?.boardId} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'pipeline',
    accessorKey: 'pipeline',
    header: () => <RecordTable.InlineHead label="Pipeline" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <PipelineSelect pipelineId={cell.row.original.value?.pipelineId} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'stage',
    accessorKey: 'stage',
    header: () => <RecordTable.InlineHead label="Stage" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <StageSelect
          pipelineId={cell.row.original.value?.pipelineId}
          stageId={cell.row.original.value?.stageId}
        />
      </RecordTableInlineCell>
    ),
  },
];

export const SettingSyncDealTable = () => (
  <SyncConfigTable code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL} columns={columns} />
);
