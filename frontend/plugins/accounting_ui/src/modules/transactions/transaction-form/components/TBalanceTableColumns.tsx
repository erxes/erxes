import { TR_SIDES } from '@/transactions/types/constants';
import { IconCalendar, IconFile, IconMoneybag } from '@tabler/icons-react';
import { Cell, ColumnDef, RowData } from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  fixNum,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { ProductsInline } from 'ui-modules';
import { AccountsInline } from '~/modules/settings/account/components/AccountsInline';
import { activeJournalState } from '../states/trStates';
import { ITBalanceTransaction } from '../types/TBalance';

// Create named components for cell renderers to fix React Hook usage
const NumberCell = ({ getValue, row }: any) => {
  const [number, setNumber] = useState(getValue() as string);
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`tbalance-${_id}-number`}>
      <RecordTableInlineCell.Trigger>
        {getValue() as string}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-full"
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const DescriptionCell = ({ getValue, row }: any) => {
  const [description, setDescription] = useState(getValue() as string);
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`tbalance-${_id}-description`}>
      <RecordTableInlineCell.Trigger>
        {getValue() as string}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-80">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
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

const AmountProdCell = ({ row, value }: { row: any, value: number }) => {
  const { detail } = row.original;
  if (!detail.productId) {
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

const DebitCell = ({ row }: any) => {
  const { detail } = row.original;
  const { amount, side } = detail;

  return (<AmountCell value={side === TR_SIDES.DEBIT ? fixNum(amount) : 0} />)
};

const CreditCell = ({ row }: any) => {
  const { detail } = row.original;
  const { amount, side } = detail;

  return (<AmountCell value={side === TR_SIDES.CREDIT ? fixNum(amount) : 0} />)
};

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

const DateCell = ({ getValue }: any) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(getValue())).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ row }: any) => {
  const { detail } = row.original;
  return (
    <RecordTableInlineCell>
      <AccountsInline accountIds={[detail.accountId]} accounts={detail.account && [detail.account]} />
    </RecordTableInlineCell>
  );
};

const ProductCell = ({ row }: any) => {
  const { detail } = row.original;
  if (!detail.productId) {
    return undefined;
  }

  return (
    <RecordTableInlineCell>
      <ProductsInline productIds={[detail.productId]} products={detail.product && [detail.product]} />
    </RecordTableInlineCell>
  );
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
  cell: TransactionMoreColumnCell,
  size: 33,
};

export type ExtendedColumnDef<TData extends RowData, TValue = unknown> =
  ColumnDef<TData, TValue> & {
    colOrder?: number;
  };

export const tbalanceColumns: ExtendedColumnDef<ITBalanceTransaction>[] = [
  transactionMoreColumn,
  {
    id: 'account',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Account" />
    ),
    accessorKey: 'account',
    cell: ({ row }) => <AccountCell row={row} />,
    colOrder: 0,
  },
  {
    id: 'number',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Number" />,
    accessorKey: 'number',
    cell: ({ getValue, row }) => <NumberCell getValue={getValue} row={row} />,
    colOrder: 1,
  },
  {
    id: 'date',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
    colOrder: 2,
  },
  {
    id: 'debit',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Debit" />,
    accessorKey: 'debit',
    cell: ({ getValue, row }) => <DebitCell getValue={getValue} row={row} />,
    colOrder: 10,
  },
  {
    id: 'credit',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Credit" />,
    accessorKey: 'credit',
    cell: ({ getValue, row }) => <CreditCell getValue={getValue} row={row} />,
    colOrder: 11,
  },
  {
    id: 'branch',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Branch" />,
    accessorKey: 'branch',
    cell: ({ getValue, row }) => <BranchCell getValue={getValue} row={row} />,
    colOrder: 20,
  },
  {
    id: 'department',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Department" />,
    accessorKey: 'department',
    cell: ({ getValue, row }) => (
      <DepartmentCell getValue={getValue} row={row} />
    ),
    colOrder: 21,
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
    size: 300,
    colOrder: 30,
  },
];

export const tbalanceInvColumns: ExtendedColumnDef<ITBalanceTransaction>[] = [
  {
    id: 'product',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Product" />
    ),
    accessorKey: 'product',
    cell: ({ row }) => <ProductCell row={row} />,
    colOrder: 15,
  },
  {
    id: 'unitPrice',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Unit Price" />,
    accessorKey: 'unitPrice',
    cell: ({ row }) => <AmountProdCell row={row} value={row.original?.detail?.unitPrice ?? 0} />,
    colOrder: 16,
  },
  {
    id: 'count',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Quantity" />,
    accessorKey: 'count',
    cell: ({ row }) => <AmountProdCell row={row} value={row.original?.detail?.count ?? 0} />,
    colOrder: 17,
  },
];