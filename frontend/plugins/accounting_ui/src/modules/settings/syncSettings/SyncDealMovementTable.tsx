import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import {
  BoardSelect,
  PipelineSelect,
  SelectBranches,
  SelectDepartments,
  StageSelect,
} from 'ui-modules';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { IConfig } from '../types/Config';
import { syncBaseColumns, SyncConfigTable } from './SyncTableShared';

export const dealMovementColumns: ColumnDef<IConfig>[] = [
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
  {
    id: 'sourceAccount',
    accessorKey: 'sourceAccount',
    header: () => <RecordTable.InlineHead label="Гарах данс" />,
    cell: ({ cell }) => (
      <SelectAccount.InlineCell
        value={cell.row.original.value?.sourceAccountId || ''}
      />
    ),
  },
  {
    id: 'destinationAccount',
    accessorKey: 'destinationAccount',
    header: () => <RecordTable.InlineHead label="Орох данс" />,
    cell: ({ cell }) => (
      <SelectAccount.InlineCell
        value={cell.row.original.value?.destinationAccountId || ''}
      />
    ),
  },
  {
    id: 'sourceBranch',
    accessorKey: 'sourceBranch',
    header: () => <RecordTable.InlineHead label="Default гарах салбар" />,
    cell: ({ cell }) => (
      <SelectBranches.InlineCell
        branchIds={[cell.row.original.value?.defaultSourceBranchId || '']}
      />
    ),
  },
  {
    id: 'sourceDepartment',
    accessorKey: 'sourceDepartment',
    header: () => <RecordTable.InlineHead label="Default гарах хэлтэс" />,
    cell: ({ cell }) => (
      <SelectDepartments.InlineCell
        departmentIds={[
          cell.row.original.value?.defaultSourceDepartmentId || '',
        ]}
      />
    ),
  },
  {
    id: 'destinationBranch',
    accessorKey: 'destinationBranch',
    header: () => <RecordTable.InlineHead label="Default орох салбар" />,
    cell: ({ cell }) => (
      <SelectBranches.InlineCell
        branchIds={[cell.row.original.value?.defaultDestinationBranchId || '']}
      />
    ),
  },
  {
    id: 'destinationDepartment',
    accessorKey: 'destinationDepartment',
    header: () => <RecordTable.InlineHead label="Default орох хэлтэс" />,
    cell: ({ cell }) => (
      <SelectDepartments.InlineCell
        departmentIds={[
          cell.row.original.value?.defaultDestinationDepartmentId || '',
        ]}
      />
    ),
  },
  {
    id: 'dealLocationSide',
    accessorKey: 'dealLocationSide',
    header: () => <RecordTable.InlineHead label="Deal байршлын тал" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.row.original.value?.dealLocationSide === 'destination'
          ? 'Орох тал'
          : 'Гарах тал'}
      </RecordTableInlineCell>
    ),
  },
];

export const SettingSyncDealMovementTable = () => (
  <SyncConfigTable
    code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_MOVEMENT}
    columns={dealMovementColumns}
    tableId="accounting_sync_deal_movement_record_table"
    showColumnSelector
  />
);
