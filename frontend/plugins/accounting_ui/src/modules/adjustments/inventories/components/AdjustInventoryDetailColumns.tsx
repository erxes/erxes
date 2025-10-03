import { Cell, ColumnDef } from '@tanstack/react-table';
import { IAdjustInventory } from '../types/AdjustInventory';
import { Link } from 'react-router-dom';
import {
  RecordTable,
  Input,
  RecordTableInlineCell,
  CurrencyFormatedDisplay,
  CurrencyCode,
  PopoverScoped,
} from 'erxes-ui';
import { IconFile, IconMoneybag } from '@tabler/icons-react';
import { useState } from 'react';

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

// const DateCell = ({ getValue }: any) => {
//   return (
//     <RecordTableInlineCell>
//       {dayjs(new Date(getValue())).format('YYYY-MM-DD')}
//     </RecordTableInlineCell>
//   );
// };

const ProductCell = ({ row }: any) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.product?.code} - ${row.original.product?.name}`}
    </RecordTableInlineCell>
  );
};

const AccountCell = ({ row }: any) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.account?.code} - ${row.original.account?.name}`}
    </RecordTableInlineCell>
  );
};

const BranchCell = ({ row }: any) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.branch?.code} - ${row.original.branch?.title}`}
    </RecordTableInlineCell>
  );
};

const DepartmentCell = ({ row }: any) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.department?.code} - ${row.original.department?.title}`}
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
          amountMicros: value,
        }}
      />
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustInventory, unknown>;
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
  cell: TransactionMoreColumnCell,
  size: 33,
};

export const adjustDetailTableColumns: ColumnDef<IAdjustInventory>[] = [
  transactionMoreColumn,
  // {
  //   id: 'date',
  //   header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
  //   accessorKey: 'date',
  //   cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
  // },
  {
    id: 'product',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Product" />
    ),
    accessorKey: 'product',
    cell: ({ row }) => <ProductCell row={row} />,
    size: 300,
  },
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
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Branch" />,
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
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Remainder" />
    ),
    accessorKey: 'remainder',
    cell: ({ getValue, row }) => <NumberCell getValue={getValue} />,
  },
  {
    id: 'unitCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Unit Cost" />
    ),
    accessorKey: 'unitCost',
    cell: ({ getValue, row }) => <NumberCell getValue={getValue} />,
  },
  {
    id: 'cost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Sum Cost" />
    ),
    accessorKey: 'cost',
    cell: ({ getValue, row }) => <NumberCell getValue={getValue} />,
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
