import dayjs from 'dayjs';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { IconCalendar, IconFile, IconMoneybag } from '@tabler/icons-react';
import { ITransaction } from '../types/Transaction';
import { Link } from 'react-router-dom';
import { TR_JOURNAL_LABELS, TrJournalEnum } from '../types/constants';
import { useState } from 'react';
import {
  RecordTable,
  Input,
  CurrencyCode,
  CurrencyFormatedDisplay,
  RecordTableInlineCell,
  PopoverScoped,
} from 'erxes-ui';

// Create named components for cell renderers to fix React Hook usage
const NumberCell = ({ getValue, row }: any) => {
  const [number, setNumber] = useState(getValue() as string);
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`accounting-${_id}-number`}>
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
    <PopoverScoped scope={`accounting-${_id}-description`}>
      <RecordTableInlineCell.Trigger>
        {getValue() as string}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const JournalCell = ({ getValue }: any) => {
  const journal = getValue() as TrJournalEnum;

  return (
    <RecordTableInlineCell>
      {TR_JOURNAL_LABELS[journal] || 'Main'}
    </RecordTableInlineCell>
  );
};

const SumDebitCell = ({ getValue, row }: any) => {
  const sumDt = getValue() as number;
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`accounting-${_id}-sumDt`}>
      <RecordTableInlineCell.Trigger>
        <CurrencyFormatedDisplay
          currencyValue={{
            currencyCode: CurrencyCode.MNT,
            amountMicros: sumDt,
          }}
        />
      </RecordTableInlineCell.Trigger>
    </PopoverScoped>
  );
};

const SumCreditCell = ({ getValue, row }: any) => {
  const sumCt = getValue() as number;
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`accounting-${_id}-sumCt`}>
      <RecordTableInlineCell.Trigger>
        <CurrencyFormatedDisplay
          currencyValue={{
            currencyCode: CurrencyCode.MNT,
            amountMicros: sumCt,
          }}
        />
      </RecordTableInlineCell.Trigger>
    </PopoverScoped>
  );
};

const BranchCell = ({ row }: any) => {
  const { branch } = row.original;

  return (
    <RecordTableInlineCell>
      {`${branch?.code ? `${branch.code} - ` : ''}${branch?.title ?? ''}`}
    </RecordTableInlineCell>
  );
};

const DepartmentCell = ({ row }: any) => {
  const { department } = row.original;

  return (
    <RecordTableInlineCell>
      {`${department?.code ? `${department.code} - ` : ''}${
        department?.title ?? ''
      }`}
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
      {details.length &&
        `${details[0].account?.code} - ${details[0].account?.name}`}
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITransaction, unknown>;
}) => {
  const { parentId, _id, originId } = cell.row.original;

  return (
    <Link
      to={`/accounting/transaction/edit?parentId=${parentId}&trId=${
        originId || _id
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

export const transactionColumns: ColumnDef<ITransaction>[] = [
  transactionMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ITransaction>,
  {
    id: 'account',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Account" />
    ),
    accessorKey: 'details',
    cell: ({ row }) => <AccountCell row={row} />,
    size: 400,
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
    id: 'sumDt',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Sum Debit" />
    ),
    accessorKey: 'sumDt',
    cell: ({ getValue, row }) => <SumDebitCell getValue={getValue} row={row} />,
  },
  {
    id: 'sumCt',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Sum Credit" />
    ),
    accessorKey: 'sumCt',
    cell: ({ getValue, row }) => (
      <SumCreditCell getValue={getValue} row={row} />
    ),
  },
  {
    id: 'journal',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Journal" />,
    accessorKey: 'journal',
    cell: ({ getValue, row }) => <JournalCell getValue={getValue} row={row} />,
  },
  {
    id: 'branch',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Branch" />,
    accessorKey: 'branch',
    cell: ({ getValue, row }) => <BranchCell getValue={getValue} row={row} />,
  },
  {
    id: 'department',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Department" />,
    accessorKey: 'department',
    cell: ({ getValue, row }) => (
      <DepartmentCell getValue={getValue} row={row} />
    ),
  },
];
