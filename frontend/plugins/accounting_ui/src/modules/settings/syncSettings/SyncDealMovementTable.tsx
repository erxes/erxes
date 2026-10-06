import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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

export const dealMovementColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IConfig>[] => [
  ...syncBaseColumns(t),
  {
    id: 'board',
    accessorKey: 'board',
    header: () => <RecordTable.InlineHead label={t('board')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <BoardSelect boardId={cell.row.original.value?.boardId} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'pipeline',
    accessorKey: 'pipeline',
    header: () => <RecordTable.InlineHead label={t('pipeline')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <PipelineSelect pipelineId={cell.row.original.value?.pipelineId} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'stage',
    accessorKey: 'stage',
    header: () => <RecordTable.InlineHead label={t('stage')} />,
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
    header: () => <RecordTable.InlineHead label={t('source-account')} />,
    cell: ({ cell }) => (
      <SelectAccount.InlineCell
        value={cell.row.original.value?.sourceAccountId || ''}
      />
    ),
  },
  {
    id: 'destinationAccount',
    accessorKey: 'destinationAccount',
    header: () => <RecordTable.InlineHead label={t('destination-account')} />,
    cell: ({ cell }) => (
      <SelectAccount.InlineCell
        value={cell.row.original.value?.destinationAccountId || ''}
      />
    ),
  },
  {
    id: 'sourceBranch',
    accessorKey: 'sourceBranch',
    header: () => <RecordTable.InlineHead label={t('default-source-branch')} />,
    cell: ({ cell }) => (
      <SelectBranches.InlineCell
        branchIds={[cell.row.original.value?.defaultSourceBranchId || '']}
      />
    ),
  },
  {
    id: 'sourceDepartment',
    accessorKey: 'sourceDepartment',
    header: () => (
      <RecordTable.InlineHead label={t('default-source-department')} />
    ),
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
    header: () => (
      <RecordTable.InlineHead label={t('default-destination-branch')} />
    ),
    cell: ({ cell }) => (
      <SelectBranches.InlineCell
        branchIds={[cell.row.original.value?.defaultDestinationBranchId || '']}
      />
    ),
  },
  {
    id: 'destinationDepartment',
    accessorKey: 'destinationDepartment',
    header: () => (
      <RecordTable.InlineHead label={t('default-destination-department')} />
    ),
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
    header: () => <RecordTable.InlineHead label={t('deal-location-side')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.row.original.value?.dealLocationSide === 'destination'
          ? t('destination-side')
          : t('source-side')}
      </RecordTableInlineCell>
    ),
  },
];

export const SettingSyncDealMovementTable = () => {
  const { t } = useTranslation('accounting');
  return (
    <SyncConfigTable
      code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_MOVEMENT}
      columns={dealMovementColumns(t)}
      tableId="accounting_sync_deal_movement_record_table"
      showColumnSelector
    />
  );
};
