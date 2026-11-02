import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
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
import {
  syncBaseColumns,
  SyncConfigTable,
  useSyncConfigValueUpdate,
} from '@/settings/syncSettings/SyncTableShared';

type TMovementAccountKey = 'sourceAccountId' | 'destinationAccountId';
type TMovementBranchKey =
  | 'defaultSourceBranchId'
  | 'defaultDestinationBranchId';
type TMovementDepartmentKey =
  | 'defaultSourceDepartmentId'
  | 'defaultDestinationDepartmentId';

const MovementAccountCell = ({
  config,
  name,
}: {
  config: IConfig;
  name: TMovementAccountKey;
}) => {
  const updateValue = useSyncConfigValueUpdate(config);
  return (
    <SelectAccount.InlineCell
      value={config.value?.[name] || ''}
      onValueChange={(value) => updateValue(name, value)}
      defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
    />
  );
};

const MovementBranchCell = ({
  config,
  name,
}: {
  config: IConfig;
  name: TMovementBranchKey;
}) => {
  const updateValue = useSyncConfigValueUpdate(config);
  return (
    <SelectBranches.InlineCell
      value={config.value?.[name] || ''}
      onValueChange={(value) => updateValue(name, value)}
    />
  );
};

const MovementDepartmentCell = ({
  config,
  name,
}: {
  config: IConfig;
  name: TMovementDepartmentKey;
}) => {
  const updateValue = useSyncConfigValueUpdate(config);
  return (
    <SelectDepartments.InlineCell
      value={config.value?.[name] || ''}
      onValueChange={(value) => updateValue(name, value)}
    />
  );
};

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
      <MovementAccountCell config={cell.row.original} name="sourceAccountId" />
    ),
  },
  {
    id: 'destinationAccount',
    accessorKey: 'destinationAccount',
    header: () => <RecordTable.InlineHead label={t('destination-account')} />,
    cell: ({ cell }) => (
      <MovementAccountCell
        config={cell.row.original}
        name="destinationAccountId"
      />
    ),
  },
  {
    id: 'sourceBranch',
    accessorKey: 'sourceBranch',
    header: () => <RecordTable.InlineHead label={t('default-source-branch')} />,
    cell: ({ cell }) => (
      <MovementBranchCell
        config={cell.row.original}
        name="defaultSourceBranchId"
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
      <MovementDepartmentCell
        config={cell.row.original}
        name="defaultSourceDepartmentId"
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
      <MovementBranchCell
        config={cell.row.original}
        name="defaultDestinationBranchId"
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
      <MovementDepartmentCell
        config={cell.row.original}
        name="defaultDestinationDepartmentId"
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
