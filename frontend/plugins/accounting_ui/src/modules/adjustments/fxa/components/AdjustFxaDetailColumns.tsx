import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCashBanknote,
  IconFileBarcode,
} from '@tabler/icons-react';
import { RecordTableInlineCell } from 'erxes-ui';
import { AccountsInline } from '@/settings/account/components/AccountsInline';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { IAdjustFxaDetail } from '../types/AdjustFixedAsset';

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

export const adjustFxaDetailColumns: ColumnDef<IAdjustFxaDetail>[] = [
  {
    id: 'fixedAssetId',
    header: () => <HeaderCell icon={IconFileBarcode} labelKey="asset" />,
    accessorKey: 'fixedAssetId',
    cell: ({ row }) => <FixedAssetCell detail={row.original} />,
    size: 220,
  },
  {
    id: 'accountId',
    header: () => <HeaderCell icon={IconBuildingBank} labelKey="account" />,
    accessorKey: 'accountId',
    cell: ({ row }) => <AccountCell detail={row.original} />,
    size: 240,
  },
  {
    id: 'originalCost',
    header: () => <HeaderCell icon={IconCashBanknote} labelKey="cost" />,
    accessorKey: 'originalCost',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'openingBookValue',
    header: () => (
      <HeaderCell icon={IconCashBanknote} labelKey="opening-balance" />
    ),
    accessorKey: 'openingBookValue',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'bookDepreciationAmount',
    header: () => (
      <HeaderCell icon={IconCashBanknote} labelKey="depreciation" />
    ),
    accessorKey: 'bookDepreciationAmount',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'closingBookValue',
    header: () => (
      <HeaderCell icon={IconCashBanknote} labelKey="closing-balance" />
    ),
    accessorKey: 'closingBookValue',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'error',
    header: () => <HeaderCell icon={IconAlertTriangle} labelKey="error" />,
    accessorKey: 'error',
    cell: ({ getValue, row }) => (
      <TextCell
        value={getValue<string | undefined>() || row.original.warning || ''}
      />
    ),
    size: 320,
  },
];
