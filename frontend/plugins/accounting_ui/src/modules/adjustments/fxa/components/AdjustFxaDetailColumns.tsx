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
import { IAdjustFxaDetail } from '../types/AdjustFixedAsset';

const formatNumber = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
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
    id: 'fxaInstanceId',
    header: () => (
      <RecordTable.InlineHead icon={IconFileBarcode} label="Хөрөнгө" />
    ),
    accessorKey: 'fxaInstanceId',
    cell: ({ row }) => <FixedAssetCell detail={row.original} />,
    size: 220,
  },
  {
    id: 'accountId',
    header: () => <RecordTable.InlineHead icon={IconBuildingBank} label="Данс" />,
    accessorKey: 'accountId',
    cell: ({ row }) => <AccountCell detail={row.original} />,
    size: 240,
  },
  {
    id: 'originalCost',
    header: () => <RecordTable.InlineHead icon={IconCashBanknote} label="Өртөг" />,
    accessorKey: 'originalCost',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'openingBookValue',
    header: () => (
      <RecordTable.InlineHead icon={IconCashBanknote} label="Эхний үлдэгдэл" />
    ),
    accessorKey: 'openingBookValue',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'bookDepreciationAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconCashBanknote} label="Элэгдэл" />
    ),
    accessorKey: 'bookDepreciationAmount',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'closingBookValue',
    header: () => (
      <RecordTable.InlineHead icon={IconCashBanknote} label="Эцсийн үлдэгдэл" />
    ),
    accessorKey: 'closingBookValue',
    cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
  },
  {
    id: 'error',
    header: () => <RecordTable.InlineHead icon={IconAlertTriangle} label="Алдаа" />,
    accessorKey: 'error',
    cell: ({ getValue, row }) => (
      <TextCell
        value={getValue<string | undefined>() || row.original.warning || ''}
      />
    ),
    size: 320,
  },
];
