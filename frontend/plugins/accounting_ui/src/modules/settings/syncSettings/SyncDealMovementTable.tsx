import { useTranslation } from 'react-i18next';
import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTableInlineCell } from 'erxes-ui';
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
    header: () => <HeaderCell labelKey="board" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <BoardSelect boardId={cell.row.original.value?.boardId} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'pipeline',
    accessorKey: 'pipeline',
    header: () => <HeaderCell labelKey="pipeline" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <PipelineSelect pipelineId={cell.row.original.value?.pipelineId} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'stage',
    accessorKey: 'stage',
    header: () => <HeaderCell labelKey="stage" />,
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
    header: () => <HeaderCell labelKey="source-account" />,
    cell: ({ cell }) => (
      <SelectAccount.InlineCell
        value={cell.row.original.value?.sourceAccountId || ''}
      />
    ),
  },
  {
    id: 'destinationAccount',
    accessorKey: 'destinationAccount',
    header: () => <HeaderCell labelKey="destination-account" />,
    cell: ({ cell }) => (
      <SelectAccount.InlineCell
        value={cell.row.original.value?.destinationAccountId || ''}
      />
    ),
  },
  {
    id: 'sourceBranch',
    accessorKey: 'sourceBranch',
    header: () => <HeaderCell labelKey="default-source-branch" />,
    cell: ({ cell }) => (
      <SelectBranches.InlineCell
        branchIds={[cell.row.original.value?.defaultSourceBranchId || '']}
      />
    ),
  },
  {
    id: 'sourceDepartment',
    accessorKey: 'sourceDepartment',
    header: () => <HeaderCell labelKey="default-source-department" />,
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
    header: () => <HeaderCell labelKey="default-destination-branch" />,
    cell: ({ cell }) => (
      <SelectBranches.InlineCell
        branchIds={[cell.row.original.value?.defaultDestinationBranchId || '']}
      />
    ),
  },
  {
    id: 'destinationDepartment',
    accessorKey: 'destinationDepartment',
    header: () => <HeaderCell labelKey="default-destination-department" />,
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
    header: () => <HeaderCell labelKey="deal-location-applies-to" />,
    cell: function DealLocationSideCell({ cell }) {
      const { t } = useTranslation('accounting');
      return (
        <RecordTableInlineCell>
          {cell.row.original.value?.dealLocationSide === 'destination'
            ? t('destination')
            : t('source')}
        </RecordTableInlineCell>
      );
    },
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
