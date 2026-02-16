import {
  CurrencyFormatedDisplay,
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useState } from 'react';
import { CurrencyCode } from '../../../../../../../libs/erxes-ui/src/types/CurrencyCode';
import { Cell, ColumnDef } from '@tanstack/table-core';
import { IAdjustClosingDetail } from '../types/AdjustClosing';
import { Link } from 'react-router-dom';
import { IconFile, IconMoneybag } from '@tabler/icons-react';

const DescriptionCell = ({ getValue, row }: any) => {
  const [description, setDescription] = useState(getValue() as string);
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`closing-${_id}-description`}>
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

const AccountCell = ({ row }: any) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.account?.code ?? ''} - ${
        row.original.account?.name ?? ''
      }`}
    </RecordTableInlineCell>
  );
};

const BranchCell = ({ row }: any) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.branch?.code ?? ''} - ${
        row.original.branch?.title ?? ''
      }`}
    </RecordTableInlineCell>
  );
};

const DepartmentCell = ({ row }: any) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.department?.code ?? ''} - ${
        row.original.department?.title ?? ''
      }`}
    </RecordTableInlineCell>
  );
};

const NumberCell = ({ getValue }: any) => {
  const value = getValue() as number;

  return (
    <RecordTableInlineCell>
      <CurrencyFormatedDisplay
        currencyValue={{
          currencyCode: CurrencyCode.MNT,
          amountMicros: value ?? 0,
        }}
      />
    </RecordTableInlineCell>
  );
};

const ClosingMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustClosingDetail, unknown>;
}) => {
  const { _id } = cell.row.original;

  return (
    <Link to={`/accounting/adjustment/closing/detail?id=${_id}`}>
      <RecordTable.MoreButton className="w-full h-full" />
    </Link>
  );
};

const closingMoreColumn = {
  id: 'more',
  cell: ClosingMoreColumnCell,
  size: 33,
};

export const adjustClosingDetailTableColumns: ColumnDef<IAdjustClosingDetail>[] =
  [
    closingMoreColumn,
    {
      id: 'account',
      header: () => (
        <RecordTable.InlineHead icon={IconMoneybag} label="Account" />
      ),
      accessorKey: 'account',
      cell: ({ row }) => <AccountCell row={row} />,
      size: 300,
    },
    {
      id: 'branch',
      header: () => (
        <RecordTable.InlineHead icon={IconMoneybag} label="Branch" />
      ),
      accessorKey: 'branch',
      cell: ({ row }) => <BranchCell row={row} />,
      size: 200,
    },
    {
      id: 'department',
      header: () => (
        <RecordTable.InlineHead icon={IconMoneybag} label="Department" />
      ),
      accessorKey: 'department',
      cell: ({ row }) => <DepartmentCell row={row} />,
      size: 200,
    },
    {
      id: 'debit',
      header: () => (
        <RecordTable.InlineHead icon={IconMoneybag} label="Debit" />
      ),
      accessorKey: 'debit',
      cell: ({ getValue }) => <NumberCell getValue={getValue} />,
    },
    {
      id: 'credit',
      header: () => (
        <RecordTable.InlineHead icon={IconMoneybag} label="Credit" />
      ),
      accessorKey: 'credit',
      cell: ({ getValue }) => <NumberCell getValue={getValue} />,
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
  ];
