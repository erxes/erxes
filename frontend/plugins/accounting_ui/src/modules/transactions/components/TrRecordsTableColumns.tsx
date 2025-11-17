import dayjs from 'dayjs';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { ITrRecord } from '../types/Transaction';
import {
  useQueryState,
  RecordTable,
  Input,
  CurrencyCode,
  CurrencyField,
  CurrencyFormatedDisplay,
  RecordTableInlineCell,
  PopoverScoped,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { renderingTransactionDetailState } from '../states/renderingTransactionDetailStates';
import { IconMoneybag, IconFile, IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';
import { TR_SIDES } from '../types/constants';

// Create named components for cell renderers to fix React Hook usage
const NumberCell = ({ getValue, row }: any) => {
  const [number, setNumber] = useState(getValue() as string);
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`transaction-${_id}-number`}>
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
    <PopoverScoped scope={`transaction-${_id}-description`}>
      <RecordTableInlineCell.Trigger>
        {getValue() as string}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const DebitCell = ({ row }: any) => {
  const { details } = row.original;
  if (details.side === TR_SIDES.CREDIT) {
    return <RecordTableInlineCell />
  }
  return (
    <RecordTableInlineCell>
      {
        <CurrencyFormatedDisplay
          currencyValue={{
            currencyCode: CurrencyCode.MNT,
            amountMicros: details.amount,
          }}
        />
      }
    </RecordTableInlineCell>
  );
};

const CreditCell = ({ row }: any) => {
  const { details } = row.original;
  if (details.side === TR_SIDES.DEBIT) {
    return <RecordTableInlineCell />
  }

  return (
    <RecordTableInlineCell>
      {
        <CurrencyFormatedDisplay
          currencyValue={{
            currencyCode: CurrencyCode.MNT,
            amountMicros: details.amount,
          }}
        />
      }
    </RecordTableInlineCell>
  );
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
  const { details } = row.original;

  return (
    <RecordTableInlineCell>
      {`${details?.account?.code} - ${details?.account?.name}`}
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITrRecord, unknown>;
}) => {
  const [, setOpen] = useQueryState('transaction_id');
  const setRenderingContactDetail = useSetAtom(renderingTransactionDetailState);
  const { _id } = cell.row.original;

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingContactDetail(false);
      }}
    />
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
    size: 500,
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
    id: 'Debit',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Debit" />
    ),
    accessorKey: 'Debit',
    cell: ({ row }) => <DebitCell row={row} />,
  },
  {
    id: 'Credit',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Credit" />
    ),
    accessorKey: 'Credit',
    cell: ({ row }) => (<CreditCell row={row} />),
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
];
