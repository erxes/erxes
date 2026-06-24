import { useTranslation } from 'react-i18next';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  IconArrowsExchange,
  IconCalendar,
  IconCoin,
  IconCurrencyDollar,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { EXCHANGE_RATE_ID_QUERY_KEY } from '../constants';
import { exchangeRateDetailAtom } from '../states/exchangeRatesStates';
import { IExchangeRate } from '../types';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { useRemoveExchangeRates } from '../hooks/useRemoveExchangeRates';
import { AddExchangeRate } from './AddExchangeRate';
import { ExchangeRatesCommandbar } from './ExchangeRatesCommandbar';

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

const ExchangeRateMoreCell = ({
  cell,
}: {
  cell: Cell<IExchangeRate, unknown>;
}) => {
  const { t } = useTranslation('mongolian');
  const [, setOpenId] = useQueryState(EXCHANGE_RATE_ID_QUERY_KEY);
  const setDetail = useSetAtom(exchangeRateDetailAtom);
  const { remove } = useRemoveExchangeRates();

  const handleEdit = () => {
    setDetail(cell.row.original);
    setOpenId(cell.row.original._id ?? null);
  };

  const handleDelete = () => {
    const id = cell.row.original._id;
    if (id) remove([id]);
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const columns: ColumnDef<IExchangeRate>[] = [
  {
    id: 'more',
    cell: ({ cell }) => <ExchangeRateMoreCell cell={cell} />,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<IExchangeRate>,
  {
    id: 'date',
    accessorKey: 'date',
    header: () => { /* eslint-disable-next-line react-hooks/rules-of-hooks */ const { t } = useTranslation('mongolian'); return <RecordTable.InlineHead label={t('date')} icon={IconCalendar} />; },
    cell: ({ cell }) => <ExchangeRateDateCell cell={cell} />,
    size: 200,
  },
  {
    id: 'mainCurrency',
    accessorKey: 'mainCurrency',
    header: () => { /* eslint-disable-next-line react-hooks/rules-of-hooks */ const { t } = useTranslation('mongolian'); return <RecordTable.InlineHead label={t('main-currency')} icon={IconCoin} />; },
    cell: ({ cell }) => <CurrencyCell value={cell.getValue() as string} />,
    size: 200,
  },
  {
    id: 'rateCurrency',
    accessorKey: 'rateCurrency',
    header: () => { /* eslint-disable-next-line react-hooks/rules-of-hooks */ const { t } = useTranslation('mongolian'); return <RecordTable.InlineHead label={t('rate-currency')} icon={IconCurrencyDollar} />; },
    cell: ({ cell }) => <CurrencyCell value={cell.getValue() as string} />,
    size: 200,
  },
  {
    id: 'rate',
    accessorKey: 'rate',
    header: () => { /* eslint-disable-next-line react-hooks/rules-of-hooks */ const { t } = useTranslation('mongolian'); return <RecordTable.InlineHead label={t('rate')} icon={IconArrowsExchange} />; },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
];

export const ExchangeRatesTable = () => {
  const { t } = useTranslation('mongolian');
  const [searchValue] = useQueryState<string>('searchValue');
  const memoizedColumns = useMemo(() => columns, []);

  const { rows, totalCount, loading, hasMore, handleLoadMore } =
    useExchangeRates(searchValue ?? undefined);

  const isInitialLoading = loading && rows.length === 0;

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <RecordTable.Provider columns={memoizedColumns} data={rows}>
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>

          {isInitialLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          )}

          {hasMore && !loading && (
            <div className="flex justify-center py-4">
              <Button variant="secondary" onClick={handleLoadMore}>
                {t('load-more', { count: totalCount - rows.length })}
              </Button>
            </div>
          )}

          {loading && rows.length > 0 && (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          )}

          {!isInitialLoading && totalCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <IconArrowsExchange
                  size={48}
                  className="text-muted-foreground/40 mb-4"
                />
                <h3 className="text-lg font-semibold text-foreground">
                  {searchValue
                    ? t('no-matching-exchange-rates')
                    : t('no-exchange-rates-yet')}
                </h3>
                <p className="mt-1 mb-4 text-sm text-muted-foreground">
                  {searchValue
                    ? t('try-different-currency')
                    : t('create-first-exchange-rate')}
                </p>
                {!searchValue && <AddExchangeRate />}
              </div>
            </div>
          )}
        </RecordTable.Scroll>
        <ExchangeRatesCommandbar />
      </RecordTable.Provider>
    </div>
  );
};
