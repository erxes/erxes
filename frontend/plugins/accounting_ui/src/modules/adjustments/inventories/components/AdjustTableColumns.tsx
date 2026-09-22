import dayjs from 'dayjs';
import { Cell, CellContext, ColumnDef } from '@tanstack/react-table';
import { IAdjustInventory } from '../types/AdjustInventory';
import { Link } from 'react-router-dom';
import {
  RecordTable,
  Input,
  RecordTableInlineCell,
  PopoverScoped,
} from 'erxes-ui';
import { IconFile, IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';

const DescriptionCell = ({
  getValue,
  row,
}: CellContext<IAdjustInventory, string>) => {
  const [description, setDescription] = useState(getValue());
  const { _id } = row.original;

  return (
    <PopoverScoped scope={`transaction-${_id}-description`}>
      <RecordTableInlineCell.Trigger>
        {getValue()}
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

const DateCell = ({ getValue }: CellContext<IAdjustInventory, Date>) => {
  return (
    <RecordTableInlineCell>
      {dayjs(new Date(getValue())).format('YYYY-MM-DD')}
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
} satisfies ColumnDef<IAdjustInventory>;

const dateColumn = {
  id: 'date',
  header: () => <RecordTable.InlineHead icon={IconCalendar} label="Огноо" />,
  accessorKey: 'date',
  cell: DateCell,
} satisfies ColumnDef<IAdjustInventory, Date>;

const descriptionColumn = {
  id: 'description',
  header: () => <RecordTable.InlineHead icon={IconFile} label="Тайлбар" />,
  accessorKey: 'description',
  cell: DescriptionCell,
  size: 300,
} satisfies ColumnDef<IAdjustInventory, string>;

export const adjustTableColumns = [
  transactionMoreColumn,
  dateColumn,
  descriptionColumn,
];
