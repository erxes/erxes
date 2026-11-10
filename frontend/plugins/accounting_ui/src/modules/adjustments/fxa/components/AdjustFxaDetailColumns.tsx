import { BranchesInline, DepartmentsInline } from 'ui-modules';
import type { TFunction } from 'i18next';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCashBanknote,
  IconFileBarcode,
} from '@tabler/icons-react';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { AccountsInline } from '@/settings/account/components/AccountsInline';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { IAdjustFxaDetail } from '@/adjustments/fxa/types/AdjustFixedAsset';

const formatNumber = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        value,
      )
    : '-';

const TextCell = ({ value }: { value?: string }) => (
  <RecordTableInlineCell>{value || '-'}</RecordTableInlineCell>
);

const NumberCell = ({ value }: { value?: number }) => (
  <RecordTableInlineCell>{formatNumber(value)}</RecordTableInlineCell>
);

const FixedAssetCell = ({ detail }: { detail: IAdjustFxaDetail }) => {
  const fixedAsset = detail.fixedAsset;

  return (
    <RecordTableInlineCell>
      <SelectFixedAsset.Provider
        mode="single"
        value={detail.fixedAssetId || ''}
        fixedAssets={fixedAsset ? [fixedAsset] : []}
        placeholder="-"
      >
        <SelectFixedAsset.Value placeholder="-" />
      </SelectFixedAsset.Provider>
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ detail }: { detail: IAdjustFxaDetail }) => (
  <RecordTableInlineCell>
    <AccountsInline
      accountIds={detail.accountId ? [detail.accountId] : []}
      accounts={detail.account ? [detail.account] : []}
      allowUnassigned
      permissionMode="read"
    />
  </RecordTableInlineCell>
);

export const adjustFxaDetailColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IAdjustFxaDetail>[] => [
  {
    id: 'fixedAssetId',
    header: () => (
      <RecordTable.InlineHead icon={IconFileBarcode} label={t('asset')} />
    ),
    accessorKey: 'fixedAssetId',
    cell: ({ row }) => <FixedAssetCell detail={row.original} />,
    size: 220,
  },
  {
    id: 'accountId',
    header: () => (
      <RecordTable.InlineHead icon={IconBuildingBank} label={t('account')} />
    ),
    accessorKey: 'accountId',
    cell: ({ row }) => <AccountCell detail={row.original} />,
    size: 240,
  },
  {
    id: 'branchId',
    accessorKey: 'branchId',
    header: () => (
      <RecordTable.InlineHead icon={IconBuildingBank} label={t('branch')} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <BranchesInline
          branchIds={row.original.branchId ? [row.original.branchId] : []}
          placeholder="-"
        />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'departmentId',
    accessorKey: 'departmentId',
    header: () => (
      <RecordTable.InlineHead icon={IconBuildingBank} label={t('department')} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <DepartmentsInline
          departmentIds={
            row.original.departmentId ? [row.original.departmentId] : []
          }
          placeholder="-"
        />
      </RecordTableInlineCell>
    ),
  },
  ...(
    [
      ['count', 'quantity'],
      ['originalCost', 'cost'],
      ['accumulatedDepreciation', 'accumulated-depreciation'],
      ['revaluationLoss', 'fxa-revaluation-loss-balance'],
      ['revaluationReserve', 'fxa-revaluation-reserve-balance'],
    ] as const
  ).map(
    ([field, label]): ColumnDef<IAdjustFxaDetail> => ({
      id: field,
      accessorKey: field,
      header: () => (
        <RecordTable.InlineHead icon={IconCashBanknote} label={t(label)} />
      ),
      cell: ({ row }) => <NumberCell value={row.original[field]} />,
    }),
  ),
  {
    id: 'previousBookValue',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCashBanknote}
        label={t('opening-balance')}
      />
    ),
    cell: ({ row }) => (
      <NumberCell
        value={
          (row.original.previous?.originalCost || 0) -
          (row.original.previous?.accumulatedDepreciation || 0)
        }
      />
    ),
  },
  {
    id: 'depreciationAmount',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCashBanknote}
        label={t('depreciation')}
      />
    ),
    accessorKey: 'depreciationAmount',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'bookValue',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCashBanknote}
        label={t('closing-balance')}
      />
    ),
    cell: ({ row }) => (
      <NumberCell
        value={
          (row.original.originalCost || 0) -
          (row.original.accumulatedDepreciation || 0)
        }
      />
    ),
  },
  {
    id: 'error',
    header: () => (
      <RecordTable.InlineHead icon={IconAlertTriangle} label={t('error')} />
    ),
    accessorKey: 'error',
    cell: ({ getValue, row }) => (
      <TextCell
        value={getValue<string | undefined>() || row.original.warning || ''}
      />
    ),
    size: 320,
  },
];
