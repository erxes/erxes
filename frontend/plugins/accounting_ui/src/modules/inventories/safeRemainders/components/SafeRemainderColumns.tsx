import dayjs from 'dayjs';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { ISafeRemainder } from '../types/SafeRemainder';
import { Link } from 'react-router-dom';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { IconFile, IconCalendar } from '@tabler/icons-react';

const formatCodeTitle = (
  record?: {
    code?: string | null;
    title?: string | null;
    name?: string | null;
  } | null,
) => {
  return [record?.code, record?.title || record?.name]
    .filter(Boolean)
    .join(' - ');
};

const DateCell = ({ value }: { value: Date | string | number }) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(value)).format('YYYY-MM-DD')}
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
  header: () => <RecordTable.ColumnSelector />,
  cell: TransactionMoreColumnCell,
  size: 33,
};

export const safeRemainderColumns: ColumnDef<ISafeRemainder>[] = [
  transactionMoreColumn,
  {
    id: 'date',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Огноо" />,
    accessorKey: 'date',
    cell: ({ row }) => <DateCell value={row.original.date} />,
  },
  {
    id: 'branch',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Салбар" />,
    accessorKey: 'branch',
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {formatCodeTitle(row.original.branch)}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'department',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Хэлтэс" />,
    accessorKey: 'department',
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {formatCodeTitle(row.original.department)}
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
