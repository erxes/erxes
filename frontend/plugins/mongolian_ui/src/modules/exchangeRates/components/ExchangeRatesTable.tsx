import { IconArrowsExchange } from '@tabler/icons-react';
import { RecordTable, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { EXCHANGE_RATES_CURSOR_SESSION_KEY } from '../constants';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { AddExchangeRate } from './AddExchangeRate';
import { ExchangeRatesCommandbar } from './ExchangeRatesCommandbar';
import { exchangeRatesColumns } from './ExchangeRatesTableColumns';

export const ExchangeRatesTable = () => {
  const { t } = useTranslation('mongolian');
  const [searchValue] = useQueryState<string>('searchValue');

  const { rows, totalCount, pageInfo, loading, handleFetchMore } =
    useExchangeRates(searchValue ?? undefined);

  const { hasNextPage, hasPreviousPage } = pageInfo || {};
  const isInitialLoading = loading && rows.length === 0;

  return (
    <RecordTable.Provider
      columns={exchangeRatesColumns(t)}
      data={rows}
      className="m-3"
      stickyColumns={['more', 'checkbox']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={rows.length}
        sessionKey={EXCHANGE_RATES_CURSOR_SESSION_KEY}
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && rows.length === 0 && (
                <RecordTable.RowSkeleton rows={40} />
              )}
              <RecordTable.RowList />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>

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
      </RecordTable.CursorProvider>
      <ExchangeRatesCommandbar />
    </RecordTable.Provider>
  );
};
