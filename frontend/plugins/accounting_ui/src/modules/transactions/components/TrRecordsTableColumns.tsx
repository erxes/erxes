import { ExtendedColumnDef } from '@/transactions/types/tables';
import { IconCalendar, IconFile, IconMoneybag } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  RecordTable,
  RecordTableInlineCell,
  fixNum,
} from 'erxes-ui';
import { Link } from 'react-router';
import { ProductsInline } from 'ui-modules';
import { TR_JOURNAL_LABELS, TR_SIDES, TrJournalEnum } from '../types/constants';
import { ITrRecord } from '../types/Transaction';

// Create named components for cell renderers to fix React Hook usage
const NumberCell = ({ row }: any) => {
  const { number } = row.original;

  return (
    <RecordTableInlineCell>
      {number}
    </RecordTableInlineCell>
  );
};

const DescriptionCell = ({ row }: any) => {
  const { description } = row.original;

  return (
    <RecordTableInlineCell>
      {description}
    </RecordTableInlineCell>
  );
};

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
}

const DebitCell = ({ row }: any) => {
  const { details } = row.original;
  const { amount, side } = details;

  return (<AmountCell value={side === TR_SIDES.DEBIT ? fixNum(amount) : 0} />)
};

const CreditCell = ({ row }: any) => {
  const { details } = row.original;
  const { amount, side } = details;

  return (<AmountCell value={side === TR_SIDES.CREDIT ? fixNum(amount) : 0} />)
};

const AmountProdCell = ({ row, value }: { row: any, value: number }) => {
  const { details } = row.original;
  if (!details?.productId) {
    return undefined;
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
}

const BranchCell = ({ row }: any) => {
  const { branch } = row.original;

  return (
    <RecordTableInlineCell>
      {[branch?.code, branch?.title].filter(Boolean).join(' - ')}
    </RecordTableInlineCell>
  );
};

const DepartmentCell = ({ row }: any) => {
  const { department } = row.original;

  return (
    <RecordTableInlineCell>
      {[department?.code, department?.title].filter(Boolean).join(' - ')}
    </RecordTableInlineCell>
  );
};

const JournalCell = ({ row }: any) => {
  const { journal } = row.original;

  return (
    <RecordTableInlineCell>
      {TR_JOURNAL_LABELS[journal as TrJournalEnum] || 'Main'}
    </RecordTableInlineCell>
  );
};


const DateCell = ({ getValue }: any) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(getValue())).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ row }: any) => {
  const { details } = row.original;

  return (
    <RecordTableInlineCell>
      {`${details?.account?.code} - ${details?.account?.name}`}
    </RecordTableInlineCell>
  );
};

const ProductCell = ({ row }: any) => {
  const { details } = row.original;
  if (!details?.productId) {
    return undefined;
  }

  return (
    <RecordTableInlineCell>
      <ProductsInline productIds={[details.productId]} products={details.product && [details.product]} />
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITrRecord, unknown>;
}) => {
  const { parentId, trId, originId } = cell.row.original;

  return (
    <Link
      to={`/accounting/transaction/edit?parentId=${parentId}&trId=${originId || trId
        }`}
    >
      <RecordTable.MoreButton className="w-full h-full" />
    </Link>
  );
};

const transactionMoreColumn = {
  id: 'more',
  cell: TransactionMoreColumnCell,
  size: 33,
  colOrder: 1,
};

export const trRecordColumns: ExtendedColumnDef<ITrRecord>[] = [
  transactionMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ITrRecord>,
  {
    id: 'account',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Account" />
    ),
    accessorKey: 'details',
    cell: ({ row }) => <AccountCell row={row} />,
    size: 300,
    colOrder: 3,
  },
  {
    id: 'number',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Number" />,
    accessorKey: 'number',
    cell: ({ getValue, row }) => <NumberCell getValue={getValue} row={row} />,
    colOrder: 5,
  },
  {
    id: 'date',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
    size: 100,
    colOrder: 7,
  },
  {
    id: 'Debit',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Debit" />
    ),
    accessorKey: 'Debit',
    cell: ({ getValue, row }) => <DebitCell getValue={getValue} row={row} />,
    colOrder: 31,
  },
  {
    id: 'Credit',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Credit" />
    ),
    accessorKey: 'Credit',
    cell: ({ getValue, row }) => <CreditCell getValue={getValue} row={row} />,
    colOrder: 32,
  },
  {
    id: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label="Description" />
    ),
    accessorKey: 'description',
    cell: ({ getValue, row }) => (
      <DescriptionCell getValue={getValue} row={row} />
    ),
    size: 200,
    colOrder: 33,
  },
  {
    id: 'branch',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Branch" />,
    accessorKey: 'branch',
    cell: ({ row }) => <BranchCell row={row} />,
    colOrder: 41,
  },
  {
    id: 'department',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Department" />,
    accessorKey: 'department',
    cell: ({ row }) => <DepartmentCell row={row} />,
    colOrder: 42,
  },
  {
    id: 'journal',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Journal" />,
    accessorKey: 'journal',
    cell: ({ row }) => <JournalCell row={row} />,
    colOrder: 43,
  },
];

export const trRecordInvColumns: ExtendedColumnDef<ITrRecord>[] = [
  {
    id: 'product',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Product" />
    ),
    accessorKey: 'product',
    cell: ({ row }) => <ProductCell row={row} />,
    colOrder: 21,
  },
  {
    id: 'unitPrice',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Unit Price" />,
    accessorKey: 'unitPrice',
    cell: ({ row }) => <AmountProdCell row={row} value={row.original?.details?.unitPrice ?? 0} />,
    colOrder: 24,
  },
  {
    id: 'count',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Quantity" />,
    accessorKey: 'count',
    cell: ({ row }) => <AmountProdCell row={row} value={row.original?.details?.count ?? 0} />,
    colOrder: 27,
  },
];
