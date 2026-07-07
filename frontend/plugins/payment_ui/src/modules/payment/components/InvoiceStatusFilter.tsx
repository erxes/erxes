import { useState } from 'react';
import { IconProgressCheck } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useFilterQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { INVOICE_STATUS_OPTIONS } from '~/modules/payment/constants';
import { INVOICES_CURSOR_SESSION_KEY } from '~/modules/payment/hooks/use-invoices';

/** Searchable command list of invoice statuses with the current selection checked. */
const SelectInvoiceStatusContent = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (status: string) => void;
}) => {
  const { t } = useTranslation('payment');

  return (
    <Command>
      <Command.Input placeholder={t('search')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-results-found')}</span>
      </Command.Empty>
      <Command.List>
        {INVOICE_STATUS_OPTIONS.map((status) => (
          <Command.Item
            key={status.value}
            value={status.value}
            onSelect={() => onValueChange(status.value)}
          >
            <span className="font-medium">{t(status.label)}</span>
            <Combobox.Check checked={value === status.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

/** Menu item that opens the status filter view from the filter popover root. */
const SelectInvoiceStatusFilterItem = () => {
  const { t } = useTranslation('payment');

  return (
    <Filter.Item value="status">
      <IconProgressCheck />
      {t('status')}
    </Filter.Item>
  );
};

/** Filter popover view that binds the status selection to the `status` query param. */
const SelectInvoiceStatusFilterView = () => {
  const [status, setStatus] = useFilterQueryState<string>(
    'status',
    INVOICES_CURSOR_SESSION_KEY,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="status">
      <SelectInvoiceStatusContent
        value={status || ''}
        onValueChange={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

/** Filter bar chip showing the selected status with a popover to change it. */
const SelectInvoiceStatusFilterBar = () => {
  const [status, setStatus] = useFilterQueryState<string>(
    'status',
    INVOICES_CURSOR_SESSION_KEY,
  );
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('payment');

  const selectedStatus = INVOICE_STATUS_OPTIONS.find(
    (option) => option.value === status,
  );

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconProgressCheck />
        {t('status')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="status">
            {selectedStatus ? t(selectedStatus.label) : status}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectInvoiceStatusContent
            value={status || ''}
            onValueChange={(value) => {
              setStatus(value || null);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

/** Compound component for filtering invoices by status. */
export const SelectInvoiceStatus = {
  Content: SelectInvoiceStatusContent,
  FilterItem: SelectInvoiceStatusFilterItem,
  FilterView: SelectInvoiceStatusFilterView,
  FilterBar: SelectInvoiceStatusFilterBar,
};
