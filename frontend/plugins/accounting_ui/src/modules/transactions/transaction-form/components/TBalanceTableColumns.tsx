import type { TFunction } from 'i18next';
import { TR_SIDES } from '@/transactions/types/constants';
import { IconCalendar, IconFile, IconMoneybag } from '@tabler/icons-react';
import { Cell, ColumnDef, Row } from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  RecordTable,
  RecordTableInlineCell,
  fixNum,
  formatAmount,
  Skeleton,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { ProductsInline, BranchesInline, DepartmentsInline } from 'ui-modules';
import { useFixedAssetDetail } from '@/settings/fixed-assets/hooks/useFixedAssetDetail';
import { AccountsInline } from '~/modules/settings/account/components/AccountsInline';
import { activeJournalState } from '../states/trStates';
import { ITBalanceTransaction } from '../types/TBalance';

export const getTBalanceLocation = (
  row: ITBalanceTransaction,
  dimension: 'branch' | 'department',
) => {
  const idKey = dimension === 'branch' ? 'branchId' : 'departmentId';
  const detailLocation = row.detail[dimension];
  const rootLocation = row[dimension];
  const id =
    row.detail[idKey] ??
    row[idKey] ??
    detailLocation?._id ??
    rootLocation?._id ??
    '';
  const location = [detailLocation, rootLocation].find(
    (value) => value?._id === id,
  );
  return { id, location };
};

const TextCell = ({ value }: { value?: string }) => (
  <RecordTableInlineCell>{value}</RecordTableInlineCell>
);

const AmountCell = ({ value }: { value: number }) => {
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

const AmountProdCell = ({
  row,
  value,
}: {
  row: Row<ITBalanceTransaction>;
  value: number;
}) => {
  const { detail } = row.original;
  if (!detail.productId && !detail.fixedAssetId) {
    return null;
  }

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

const CountProdCell = ({
  row,
  value,
}: {
  row: Row<ITBalanceTransaction>;
  value: number;
}) => {
  const { detail } = row.original;
  if (!detail.productId && !detail.fixedAssetId) {
    return null;
  }

  return <RecordTableInlineCell>{formatAmount(value)}</RecordTableInlineCell>;
};

const DebitCell = ({ row }: { row: Row<ITBalanceTransaction> }) => {
  const { detail, side } = row.original;
  const { amount } = detail;

  return <AmountCell value={side === TR_SIDES.DEBIT ? fixNum(amount) : 0} />;
};

const CreditCell = ({ row }: { row: Row<ITBalanceTransaction> }) => {
  const { detail, side } = row.original;
  const { amount } = detail;

  return <AmountCell value={side === TR_SIDES.CREDIT ? fixNum(amount) : 0} />;
};

const BranchCell = ({ row }: { row: Row<ITBalanceTransaction> }) => {
  const { id, location } = getTBalanceLocation(row.original, 'branch');
  const content = location ? (
    [location.code, location.title].filter(Boolean).join(' - ') || '-'
  ) : (
    <BranchesInline branchIds={[id]} placeholder="-" />
  );
  return <RecordTableInlineCell>{id ? content : '-'}</RecordTableInlineCell>;
};

const DepartmentCell = ({ row }: { row: Row<ITBalanceTransaction> }) => {
  const { id, location } = getTBalanceLocation(row.original, 'department');
  const content = location ? (
    [location.code, location.title].filter(Boolean).join(' - ') || '-'
  ) : (
    <DepartmentsInline departmentIds={[id]} placeholder="-" />
  );
  return <RecordTableInlineCell>{id ? content : '-'}</RecordTableInlineCell>;
};

const DateCell = ({ row }: { row: Row<ITBalanceTransaction> }) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(row.original.date)).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ row }: { row: Row<ITBalanceTransaction> }) => {
  const { detail } = row.original;
  const accountIds = useMemo(
    () => (detail.accountId ? [detail.accountId] : []),
    [detail.accountId],
  );
  const accounts = useMemo(
    () => (detail.account ? [detail.account] : undefined),
    [detail.account],
  );

  return (
    <RecordTableInlineCell>
      <AccountsInline accountIds={accountIds} accounts={accounts} />
    </RecordTableInlineCell>
  );
};

const FixedAssetItemCell = ({ fixedAssetId }: { fixedAssetId: string }) => {
  const { fixedAssetDetail, loading } = useFixedAssetDetail(fixedAssetId);
  return (
    <RecordTableInlineCell>
      {loading ? (
        <Skeleton className="h-4 w-32" />
      ) : (
        [fixedAssetDetail?.code, fixedAssetDetail?.name]
          .filter(Boolean)
          .join(' - ') || '-'
      )}
    </RecordTableInlineCell>
  );
};

const ItemCell = ({ row }: { row: Row<ITBalanceTransaction> }) => {
  const { detail } = row.original;
  if (detail.productId) {
    return (
      <RecordTableInlineCell>
        <ProductsInline productIds={[detail.productId]} />
      </RecordTableInlineCell>
    );
  }
  if (detail.fixedAssetId) {
    return <FixedAssetItemCell fixedAssetId={detail.fixedAssetId} />;
  }
  return null;
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITBalanceTransaction, unknown>;
}) => {
  const setActiveJournal = useSetAtom(activeJournalState);
  const { journalIndex } = cell.row.original;

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setActiveJournal(journalIndex);
      }}
    />
  );
};

const transactionMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TransactionMoreColumnCell,
  size: 33,
};

export const tbalanceColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<ITBalanceTransaction>[] => [
  transactionMoreColumn,
  {
    id: 'account',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('account')} />
    ),
    accessorKey: 'account',
    cell: ({ row }) => <AccountCell row={row} />,
  },
  {
    id: 'number',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('number')} />
    ),
    accessorKey: 'number',
    cell: ({ getValue }) => <TextCell value={getValue() as string} />,
  },
  {
    id: 'date',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label={t('date')} />
    ),
    accessorKey: 'date',
    cell: ({ row }) => <DateCell row={row} />,
  },
  {
    id: 'debit',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('debit')} />
    ),
    accessorKey: 'debit',
    cell: ({ row }) => <DebitCell row={row} />,
  },
  {
    id: 'credit',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('credit')} />
    ),
    accessorKey: 'credit',
    cell: ({ row }) => <CreditCell row={row} />,
  },
  {
    id: 'item-details',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('item')} />
    ),
    accessorKey: 'item-details',
    cell: ({ row }) => <ItemCell row={row} />,
  },
  {
    id: 'unitPrice-details',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('unit-price')} />
    ),
    accessorKey: 'unitPrice-details',
    cell: ({ row }) => (
      <AmountProdCell row={row} value={row.original?.detail?.unitPrice ?? 0} />
    ),
  },
  {
    id: 'count-details',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('quantity-label')} />
    ),
    accessorKey: 'count-details',
    cell: ({ row }) => (
      <CountProdCell row={row} value={row.original?.detail?.count ?? 0} />
    ),
  },
  {
    id: 'branch',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('branch')} />
    ),
    accessorKey: 'branch',
    cell: ({ row }) => <BranchCell row={row} />,
  },
  {
    id: 'department',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('department')} />
    ),
    accessorKey: 'department',
    cell: ({ row }) => <DepartmentCell row={row} />,
  },
  {
    id: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('description')} />
    ),
    accessorKey: 'description',
    cell: ({ getValue }) => <TextCell value={getValue() as string} />,
    size: 300,
  },
];
