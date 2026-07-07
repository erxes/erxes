import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { INVOICES_CURSOR_SESSION_KEY } from '~/modules/payment/hooks/use-invoices';
import { SelectInvoiceKind } from './InvoiceKindFilter';
import { SelectInvoiceStatus } from './InvoiceStatusFilter';
import { InvoiceTotalCount } from './InvoiceTotalCount';

/** Root view of the invoice filter popover listing the available filters. */
const InvoiceFilterRootView = () => {
  const { t } = useTranslation('payment');

  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder={t('filter-invoices')}
          variant="secondary"
          className="bg-background"
        />
        <Command.List className="p-1 max-h-none">
          <Filter.SearchValueTrigger />
          <SelectInvoiceStatus.FilterItem />
          <SelectInvoiceKind.FilterItem />
        </Command.List>
      </Command>
    </Filter.View>
  );
};

/** Popover and dialog for picking invoice filters (search, status, kind). */
const InvoiceFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    status: string;
    kind: string;
  }>(['searchValue', 'status', 'kind']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="invoices-page">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <InvoiceFilterRootView />
          <SelectInvoiceStatus.FilterView />
          <SelectInvoiceKind.FilterView />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

/** Filter bar for the invoices list with active filter chips and total count. */
export const InvoiceFilterBar = () => {
  return (
    <Filter id="invoices" sessionKey={INVOICES_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <InvoiceFilterPopover />
        <Filter.SearchValueBarItem />
        <SelectInvoiceStatus.FilterBar />
        <SelectInvoiceKind.FilterBar />
        <InvoiceTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
