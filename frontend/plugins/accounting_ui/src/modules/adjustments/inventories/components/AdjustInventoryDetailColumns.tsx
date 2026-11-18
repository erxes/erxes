import type { TFunction } from 'i18next';
import { Cell, CellContext, ColumnDef, Row } from '@tanstack/react-table';
import { IAdjustInvDetail } from '@/adjustments/inventories/types/AdjustInventory';
import { Link } from 'react-router-dom';
import {
  RecordTable,
  RecordTableInlineCell,
  CurrencyFormatedDisplay,
  CurrencyCode,
} from 'erxes-ui';
import { BranchBadge, DepartmentBadge } from 'ui-modules';
import { IconFile, IconMoneybag } from '@tabler/icons-react';

const DescriptionCell = ({ value }: { value?: string }) => (
  <RecordTableInlineCell>{value}</RecordTableInlineCell>
);

const ProductCell = ({ row }: { row: Row<IAdjustInvDetail> }) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.product?.code} - ${row.original.product?.name}`}
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ row }: { row: Row<IAdjustInvDetail> }) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.account?.code} - ${row.original.account?.name}`}
    </RecordTableInlineCell>
  );
};

const BranchCell = ({ row }: { row: Row<IAdjustInvDetail> }) => {
  const { branchId } = row.original;

  return (
    <RecordTableInlineCell>
      {branchId ? <BranchBadge branchId={branchId} renderAsPlainText /> : '-'}
    </RecordTableInlineCell>
  );
};

const DepartmentCell = ({ row }: { row: Row<IAdjustInvDetail> }) => {
  const { departmentId } = row.original;

  return (
    <RecordTableInlineCell>
      {departmentId ? (
        <DepartmentBadge departmentId={departmentId} renderAsPlainText />
      ) : (
        '-'
      )}
    </RecordTableInlineCell>
  );
};

const NumberCell = ({
  getValue,
}: Pick<CellContext<IAdjustInvDetail, unknown>, 'getValue'>) => {
  const value = getValue() as number;

  return (
    <RecordTableInlineCell>
      <CurrencyFormatedDisplay
        currencyValue={{
          currencyCode: CurrencyCode.MNT,
          amountMicros: value,
        }}
      />
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustInvDetail, unknown>;
}) => {
  const { _id } = cell.row.original;

  return (
    <Link to={`/accounting/adjustment/inventory/detail?id=${_id}`}>
      <RecordTable.MoreButton className="w-full h-full" />
    </Link>
  );
};

const transactionMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TransactionMoreColumnCell,
  size: 33,
};

export const adjustDetailTableColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IAdjustInvDetail>[] => [
  transactionMoreColumn,
  {
    id: 'product',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('inventory')} />
    ),
    accessorKey: 'product',
    cell: ({ row }) => <ProductCell row={row} />,
    size: 300,
  },
  {
    id: 'account',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('account')} />
    ),
    accessorKey: 'account',
    cell: ({ row }) => <AccountCell row={row} />,
    size: 300,
  },
  {
    id: 'branch',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('branch')} />
    ),
    accessorKey: 'branch',
    cell: ({ row }) => <BranchCell row={row} />,
    size: 200,
  },
  {
    id: 'department',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('department')} />
    ),
    accessorKey: 'department',
    cell: ({ row }) => <DepartmentCell row={row} />,
    size: 200,
  },
  {
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('remainder')} />
    ),
    accessorKey: 'remainder',
    cell: ({ getValue }) => <NumberCell getValue={getValue} />,
  },
  {
    id: 'unitCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('unit-cost')} />
    ),
    accessorKey: 'unitCost',
    cell: ({ getValue }) => <NumberCell getValue={getValue} />,
  },
  {
    id: 'cost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('total-cost')} />
    ),
    accessorKey: 'cost',
    cell: ({ getValue }) => <NumberCell getValue={getValue} />,
  },
  {
    id: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('description')} />
    ),
    accessorKey: 'description',
    cell: ({ getValue }) => <DescriptionCell value={getValue() as string} />,
    size: 300,
  },
];
