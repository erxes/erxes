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
};

export const trRecordColumns: ColumnDef<ITrRecord>[] = [
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
  },
  {
    id: 'number',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Number" />,
    accessorKey: 'number',
    cell: ({ getValue, row }) => <NumberCell getValue={getValue} row={row} />,
  },
  {
    id: 'date',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
    size: 100,
  },
  {
    id: 'product-inv',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Product" />
    ),
    accessorKey: 'product-inv',
    cell: ({ row }) => <ProductCell row={row} />,
  },
  {
    id: 'unitPrice-inv',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Unit Price" />,
    accessorKey: 'unitPrice-inv',
    cell: ({ row }) => <AmountProdCell row={row} value={row.original?.details?.unitPrice ?? 0} />,
  },
  {
    id: 'count-inv',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Quantity" />,
    accessorKey: 'count-inv',
    cell: ({ row }) => <AmountProdCell row={row} value={row.original?.details?.count ?? 0} />,
  },
  {
    id: 'Debit',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Debit" />
    ),
    accessorKey: 'Debit',
    cell: ({ getValue, row }) => <DebitCell getValue={getValue} row={row} />,
  },
  {
    id: 'Credit',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Credit" />
    ),
    accessorKey: 'Credit',
    cell: ({ getValue, row }) => <CreditCell getValue={getValue} row={row} />,
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
  },
  {
    id: 'branch',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Branch" />,
    accessorKey: 'branch',
    cell: ({ row }) => <BranchCell row={row} />,
  },
  {
    id: 'department',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Department" />,
    accessorKey: 'department',
    cell: ({ row }) => <DepartmentCell row={row} />,
  },
  {
    id: 'journal',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Journal" />,
    accessorKey: 'journal',
    cell: ({ row }) => <JournalCell row={row} />,
  },
];
