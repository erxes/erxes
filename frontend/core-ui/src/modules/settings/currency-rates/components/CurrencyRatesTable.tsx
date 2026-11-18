import {
  IconArrowsExchange,
  IconPlus,
  IconSearchOff,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  Empty,
  RecordTable,
  Separator,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { CURRENCY_RATES_CURSOR_SESSION_KEY } from '../constants';
import { useCurrencyRatesRemove } from '../hooks/useCurrencyRateMutations';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { currencyRateSheetAtom } from '../state';
import { currencyRatesColumns } from './CurrencyRatesColumns';

const CurrencyRatesCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'currency-rates' });
  const { table } = RecordTable.useRecordTable();
  const { remove, loading } = useCurrencyRatesRemove();
  const selected = table.getFilteredSelectedRowModel().rows;

  return (
    <CommandBar open={selected.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {t('selected', { count: selected.length, defaultValue: '{{count}} selected' })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() =>
            remove(
              selected.map((row) => row.original._id),
              () => table.setRowSelection({}),
            )
          }
        >
          <IconTrash />
          {t('delete', 'Delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const CurrencyRatesTable = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'currency-rates' });
  const setSheet = useSetAtom(currencyRateSheetAtom);
  const { rates, pageInfo, loading, error, isFiltered, handleFetchMore } =
    useCurrencyRates();
  const columns = useMemo(() => currencyRatesColumns(t), [t]);
  const isEmpty = !loading && !error && rates.length === 0;

  return (
    <RecordTable.Provider
      columns={columns}
      data={rates}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'date']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={rates.length}
        sessionKey={CURRENCY_RATES_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && rates.length === 0 && (
              <RecordTable.RowSkeleton rows={20} />
            )}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {error && (
          <Empty className="m-3 min-h-80">
            <Empty.Header>
              <Empty.Title>
                {t('load-error', 'Could not load exchange rates')}
              </Empty.Title>
              <Empty.Description>{error.message}</Empty.Description>
            </Empty.Header>
          </Empty>
        )}
        {isEmpty && (
          <Empty className="m-3 min-h-80">
            <Empty.Header>
              <Empty.Media variant="icon">
                {isFiltered ? <IconSearchOff /> : <IconArrowsExchange />}
              </Empty.Media>
              <Empty.Title>
                {isFiltered
                  ? t('no-match', 'No rates for this currency')
                  : t('empty', 'No exchange rates yet')}
              </Empty.Title>
              <Empty.Description>
                {isFiltered
                  ? t('no-match-description', 'Pick another currency or show all.')
                  : t(
                      'empty-description',
                      'Record the daily rate of each currency you sell in.',
                    )}
              </Empty.Description>
            </Empty.Header>
            {!isFiltered && (
              <Can action="exchangeRatesManage">
                <Button onClick={() => setSheet('new')}>
                  <IconPlus />
                  {t('add-rate', 'Add rate')}
                </Button>
              </Can>
            )}
          </Empty>
        )}
      </RecordTable.CursorProvider>
      <CurrencyRatesCommandBar />
    </RecordTable.Provider>
  );
};
