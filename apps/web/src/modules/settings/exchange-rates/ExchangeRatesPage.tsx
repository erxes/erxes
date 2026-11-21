import type { ExchangeRate } from '@erxes/core-contract';
import {
  IconArrowsExchange,
  IconCurrencyDollar,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  buttonVariants,
  CommandBar,
  Empty,
  InputGroup,
  PageContainer,
  PageHeader,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CursorRecordTable } from '~/components/CursorRecordTable';
import { useSelectedRows } from '~/components/useSelectedRows';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { exchangeRateColumns, type RateActions } from './ExchangeRateColumns';
import { ExchangeRateSheet } from './ExchangeRateSheet';
import {
  useExchangeRateSearch,
  useExchangeRates,
  useRemoveExchangeRates,
} from './useExchangeRates';

/** 3.x's search: either currency, applied on Enter or the search button. */
const ExchangeRatesSearch = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });
  const [searchValue, setSearchValue] = useExchangeRateSearch();
  const [search, setSearch] = useState(searchValue ?? '');
  const [applied, setApplied] = useState(searchValue);

  // The address changed elsewhere (back, a link): show its search.
  if (applied !== searchValue) {
    setApplied(searchValue);
    setSearch(searchValue ?? '');
  }

  const apply = () => void setSearchValue(search.trim() || null);

  return (
    <InputGroup className="w-48">
      <InputGroup.Input
        value={search}
        placeholder={t('search', 'Search')}
        aria-label={t('search', 'Search')}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') apply();
        }}
      />
      <InputGroup.Addon align="end">
        <Button variant="ghost" size="icon" aria-label={t('search', 'Search')} onClick={apply}>
          <IconSearch />
        </Button>
      </InputGroup.Addon>
    </InputGroup>
  );
};

/** Asks before deleting, as 3.x did, then deletes. */
const useRemoveWithConfirm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });
  const { confirm } = useConfirm();
  const remove = useRemoveExchangeRates();

  return (ids: string[], onDone?: () => void) =>
    void confirm({
      message:
        ids.length > 1
          ? t(
              'delete-exchange-rates',
              'Are you sure you want to delete the selected exchange rates?',
            )
          : t('delete-exchange-rate', 'Are you sure you want to delete this exchange rate?'),
      options: { okLabel: t('delete', 'Delete'), cancelLabel: t('cancel', 'Cancel') },
    }).then(() => remove.mutate({ ids }, { onSuccess: onDone }));
};

const ExchangeRatesCommandBar = ({
  rows,
  onRemove,
}: {
  rows: ExchangeRate[];
  onRemove: RateActions['onRemove'];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });
  const { table } = RecordTable.useRecordTable();
  const selected = useSelectedRows(rows);

  return (
    <CommandBar open={selected.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {selected.length} {t('selected', 'selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          onClick={() =>
            onRemove(
              selected.map((rate) => rate.id),
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

/** 3.x's empty list: nothing matches the search, or no rates yet with a button to add one. */
const ExchangeRatesEmpty = ({ onAdd }: { onAdd?: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });
  const [searchValue] = useExchangeRateSearch();

  return (
    <Empty className="absolute inset-x-0 top-1/4">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconArrowsExchange />
        </Empty.Media>
        <Empty.Title>
          {searchValue
            ? t('no-matching-exchange-rates', 'No matching exchange rates')
            : t('no-exchange-rates-yet', 'No exchange rates yet')}
        </Empty.Title>
        <Empty.Description>
          {searchValue
            ? t('try-different-currency', 'Try a different currency filter.')
            : t('create-first-exchange-rate', 'Get started by adding your first exchange rate.')}
        </Empty.Description>
      </Empty.Header>
      {!searchValue && onAdd && (
        <Empty.Content>
          <Button onClick={onAdd}>
            <IconPlus />
            {t('add-exchange-rate', 'Add Exchange Rate')}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};

/**
 * Settings › Exchange rates, 3.x's mongolian page: the rates newest first with search, a sheet
 * to add or edit one, and deleting from a row or the selection. Every member reads them;
 * `exchange_rates.manage` changes them.
 */
export const ExchangeRatesPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });
  const cursor = useExchangeRates();
  const canManage = useCan()('exchange_rates.manage');
  const removeWithConfirm = useRemoveWithConfirm();

  // Each opening is a new sheet (`opened`), so its form starts from the rate or from blank.
  const [sheet, setSheet] = useState<{ open: boolean; rate: ExchangeRate | null; opened: number }>({
    open: false,
    rate: null,
    opened: 0,
  });

  const openSheet = (rate: ExchangeRate | null) =>
    setSheet((current) => ({ open: true, rate, opened: current.opened + 1 }));

  const add = () => openSheet(null);

  const columns = exchangeRateColumns(t, {
    canManage,
    onEdit: openSheet,
    onRemove: removeWithConfirm,
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Link to={paths.settings.exchangeRates} className={buttonVariants({ variant: 'ghost' })}>
            <IconCurrencyDollar />
            {t('exchange-rates-label', 'Exchange Rates')}
          </Link>
        </PageHeader.Start>
        <PageHeader.End>
          <ExchangeRatesSearch />
          {canManage && (
            <Button onClick={add}>
              <IconPlus />
              {t('add-exchange-rate', 'Add Exchange Rate')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <div className="flex w-full flex-auto flex-col overflow-hidden">
        <CursorRecordTable
          cursor={cursor}
          columns={columns}
          stickyColumns={['more', 'checkbox']}
          tableId="exchange_rates_record_table"
          empty={<ExchangeRatesEmpty onAdd={canManage ? add : undefined} />}
        >
          {canManage && <ExchangeRatesCommandBar rows={cursor.list} onRemove={removeWithConfirm} />}
        </CursorRecordTable>
      </div>
      <ExchangeRateSheet
        key={sheet.opened}
        rate={sheet.rate}
        open={sheet.open}
        onOpenChange={(open) => setSheet((current) => ({ ...current, open }))}
      />
    </PageContainer>
  );
};
