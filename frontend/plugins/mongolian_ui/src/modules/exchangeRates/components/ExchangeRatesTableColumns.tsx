import {
  IconArrowsExchange,
  IconCalendar,
  IconCoin,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import dayjs from 'dayjs';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { EXCHANGE_RATE_ID_QUERY_KEY } from '../constants';
import { exchangeRateDetailAtom } from '../states/exchangeRatesStates';
import { IExchangeRate } from '../types';
import { exchangeRatesMoreColumn } from './ExchangeRatesTableMoreColumn';

const ExchangeRateDateCell = ({
  cell,
}: {
  cell: Cell<IExchangeRate, unknown>;
}) => {
  const [, setOpenId] = useQueryState(EXCHANGE_RATE_ID_QUERY_KEY);
  const setDetail = useSetAtom(exchangeRateDetailAtom);

  return (
    <RecordTableInlineCell
      className="cursor-pointer font-medium"
      onClick={() => {
        setDetail(cell.row.original);
        setOpenId(cell.row.original._id ?? null);
      }}
    >
      {dayjs(cell.row.original.date).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

const CurrencyCell = ({ value }: { value?: string }) => (
  <RecordTableInlineCell>
    {value ? <Badge variant="secondary">{value}</Badge> : null}
  </RecordTableInlineCell>
);

const checkBoxColumn = {
  ...RecordTable.checkboxColumn,
  size: 24,
  minSize: 24,
} as ColumnDef<IExchangeRate>;

export const exchangeRatesColumns = (
  t: TFunction,
): ColumnDef<IExchangeRate>[] => [
  exchangeRatesMoreColumn,
  checkBoxColumn,
  {
    id: 'date',
    accessorKey: 'date',
    header: () => (
      <RecordTable.InlineHead label={t('date')} icon={IconCalendar} />
    ),
    cell: ({ cell }) => <ExchangeRateDateCell cell={cell} />,
    size: 200,
  },
  {
    id: 'mainCurrency',
    accessorKey: 'mainCurrency',
    header: () => (
      <RecordTable.InlineHead label={t('main-currency')} icon={IconCoin} />
    ),
    cell: ({ cell }) => <CurrencyCell value={cell.getValue() as string} />,
    size: 200,
  },
  {
    id: 'rateCurrency',
    accessorKey: 'rateCurrency',
    header: () => (
      <RecordTable.InlineHead
        label={t('rate-currency')}
        icon={IconCurrencyDollar}
      />
    ),
    cell: ({ cell }) => <CurrencyCell value={cell.getValue() as string} />,
    size: 200,
  },
  {
    id: 'rate',
    accessorKey: 'rate',
    header: () => (
      <RecordTable.InlineHead label={t('rate')} icon={IconArrowsExchange} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
];
