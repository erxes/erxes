import { Cell, ColumnDef } from '@tanstack/table-core';
import { IAdjustClosing } from '../types/AdjustClosing';
import { Link } from 'react-router';
import {
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import {
  IconBuildingBank,
  IconCalendar,
  IconFile,
  IconFlag,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState } from 'react';

const DescriptionCell = ({ getValue, row }: any) => {
  const [description, setDescription] = useState(getValue() as string);
  const _id = row?.original?._id;

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
  const date = getValue();
  return (
    <RecordTableInlineCell>
      {date ? dayjs(date).format('YYYY-MM-DD') : '-'}
    </RecordTableInlineCell>
  );
};

const TransactionMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustClosing, unknown>;
}) => {
  const { _id } = cell.row.original;

  return (
    <Link to={`/accounting/adjustment/closing/detail?id=${_id}`}>
      <RecordTable.MoreButton className="w-full h-full" />
    </Link>
  );
};

const TextCell = ({ getValue }: any) => {
  const value = getValue();
  return <RecordTableInlineCell>{value || '-'}</RecordTableInlineCell>;
};

const transactionMoreColumn = {
  id: 'more',
  cell: TransactionMoreColumnCell,
  size: 33,
};

export const adjustClosingTableColumns: ColumnDef<IAdjustClosing>[] = [
  transactionMoreColumn,
  {
    id: 'status',
    header: () => <RecordTable.InlineHead icon={IconFlag} label="Status" />,
    accessorKey: 'status',
    cell: ({ getValue }) => <DescriptionCell getValue={getValue} />,
    size: 100,
  },
  {
    id: 'date',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
  },
  {
    id: 'beginDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Begin date" />
    ),
    accessorKey: 'beginDate',
    cell: ({ getValue }) => <DateCell getValue={getValue} />,
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
  },
  {
    id: 'integrateAccountId',
    header: () => (
      <RecordTable.InlineHead
        icon={IconBuildingBank}
        label="Integrate account"
      />
    ),
    accessorKey: 'integrateAccountId',
    cell: ({ getValue }) => <TextCell getValue={getValue} />,
  },

  {
    id: 'periodGLAccountId',
    header: () => (
      <RecordTable.InlineHead
        icon={IconBuildingBank}
        label="Period GL account"
      />
    ),
    accessorKey: 'periodGLAccountId',
    cell: ({ getValue }) => <TextCell getValue={getValue} />,
  },

  {
    id: 'earningAccountId',
    header: () => (
      <RecordTable.InlineHead icon={IconBuildingBank} label="Earning account" />
    ),
    accessorKey: 'earningAccountId',
    cell: ({ getValue }) => <TextCell getValue={getValue} />,
  },

  {
    id: 'taxPayableAccountId',
    header: () => (
      <RecordTable.InlineHead
        icon={IconBuildingBank}
        label="Tax payable account"
      />
    ),
    accessorKey: 'taxPayableAccountId',
    cell: ({ getValue }) => <TextCell getValue={getValue} />,
  },
];
