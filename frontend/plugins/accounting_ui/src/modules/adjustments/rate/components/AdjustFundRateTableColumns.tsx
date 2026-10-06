import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { RecordTableInlineCell, RecordTable } from 'erxes-ui';
import {
  IconCurrencyDollar,
  IconCalendar,
  IconFile,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { IAdjustFundRate } from '../types/AdjustFundRate';
import { Link } from 'react-router-dom';

const AdjustFundRateMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustFundRate, unknown>;
}) => {
  const { _id } = cell.row.original;
  return (
    <Link to={`/accounting/adjustment/fundRate/detail?id=${_id}`}>
      <RecordTable.MoreButton className="w-full h-full" />
    </Link>
  );
};

export const adjustFundRateColumns: ColumnDef<IAdjustFundRate>[] = [
  {
    id: 'more',
    cell: AdjustFundRateMoreColumnCell,
    size: 33,
  },
  {
    id: 'date',
    header: () => <HeaderCell icon={IconCalendar} labelKey="date" />,
    accessorKey: 'date',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        {dayjs(new Date(getValue() as Date)).format('YYYY-MM-DD')}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'mainCurrency',
    header: () => <HeaderCell icon={IconCurrencyDollar} labelKey="main" />,
    accessorKey: 'mainCurrency',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>{getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'currency',
    header: () => (
      <HeaderCell icon={IconCurrencyDollar} labelKey="foreign-currency" />
    ),
    accessorKey: 'currency',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>{getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'spotRate',
    header: () => <HeaderCell labelKey="exchange-rate" />,
    accessorKey: 'spotRate',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        {(getValue() as number)?.toFixed(4) || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'description',
    header: () => <HeaderCell icon={IconFile} labelKey="description" />,
    accessorKey: 'description',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        {(getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
    size: 250,
  },
];
