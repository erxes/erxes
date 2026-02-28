import dayjs from 'dayjs';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { ISafeRemainder } from '../types/SafeRemainder';
import { Link } from 'react-router-dom';
import {
  RecordTable,
  Input,
  RecordTableInlineCell,
  PopoverScoped,
} from 'erxes-ui';
import { IconFile, IconCalendar } from '@tabler/icons-react';
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

const DateCell = ({ getValue }: any) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(getValue())).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ISafeRemainder, unknown>;
}) => {
  const { _id } = cell.row.original;

  return (
    <Link to={`/accounting/inventories/safe-remainder/detail?id=${_id}`}>
      <RecordTable.MoreButton className="w-full h-full" />
    </Link>
  );
};

const transactionMoreColumn = {
  id: 'more',
  cell: TransactionMoreColumnCell,
  size: 33,
};

export const safeRemainderColumns: ColumnDef<ISafeRemainder>[] = [
  transactionMoreColumn,
  {
    id: 'date',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
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
