import type { TFunction } from 'i18next';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { RecordTableInlineCell, RecordTable } from 'erxes-ui';
import {
  IconCurrencyDollar,
  IconCalendar,
  IconFile,
  IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { IAdjustDebtRate } from '../types/AdjustDebtRate';
import { Link } from 'react-router-dom';

const AdjustDebtRateMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustDebtRate, unknown>;
}) => {
  const { _id } = cell.row.original;
  return (
    <Link to={`/accounting/adjustment/debRate/detail?id=${_id}`}>
      <RecordTable.MoreButton className="w-full h-full" />
    </Link>
  );
};

export const adjustDebtRateColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IAdjustDebtRate>[] => [
  {
    id: 'more',
    cell: AdjustDebtRateMoreColumnCell,
    size: 33,
  },
  {
    id: 'date',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label={t('date')} />
    ),
    accessorKey: 'date',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        {dayjs(new Date(getValue() as Date)).format('YYYY-MM-DD')}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'mainCurrency',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('main')} />
    ),
    accessorKey: 'mainCurrency',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>{getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'currency',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('Foreign')} />
    ),
    accessorKey: 'currency',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>{getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'spotRate',
    header: () => <RecordTable.InlineHead label={t('Rate')} />,
    accessorKey: 'spotRate',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        {(getValue() as number)?.toFixed(4) || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'customerType',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('customer-type')} />
    ),
    accessorKey: 'customerType',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        {(getValue() as string) || 'All'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label={t('description')} />
    ),
    accessorKey: 'description',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        {(getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
    size: 250,
  },
];
