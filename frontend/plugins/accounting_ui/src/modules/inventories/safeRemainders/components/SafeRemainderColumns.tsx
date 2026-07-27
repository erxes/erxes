import dayjs from 'dayjs';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { ISafeRemainder } from '../types/SafeRemainder';
import { Link } from 'react-router-dom';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { IconFile, IconCalendar } from '@tabler/icons-react';

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
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Огноо" />,
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
  },
  {
    id: 'branch',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Салбар" />,
    accessorKey: 'branch',
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {`${row.original.branch?.code} - ${row.original.branch?.title}`}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'department',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Хэлтэс" />,
    accessorKey: 'department',
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {`${row.original.department?.code} - ${row.original.department?.title}`}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'description',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Тайлбар" />,
    accessorKey: 'description',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>{getValue() as string}</RecordTableInlineCell>
    ),
  },
];
