import { useState } from 'react';
import { IconWallet } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useFilterQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { INVOICES_CURSOR_SESSION_KEY } from '~/modules/payment/hooks/use-invoices';

/** Searchable command list of payment kinds with the current selection checked. */
const SelectInvoiceKindContent = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (kind: string) => void;
}) => {
  const { t } = useTranslation('payment');

  return (
    <Command>
      <Command.Input placeholder={t('search')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-results-found')}</span>
      </Command.Empty>
      <Command.List>
        {Object.entries(PAYMENT_KINDS).map(([kind, config]) => (
          <Command.Item
            key={kind}
            value={kind}
            onSelect={() => onValueChange(kind)}
          >
            <span className="font-medium">{config.name}</span>
            <Combobox.Check checked={value === kind} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

/** Menu item that opens the kind filter view from the filter popover root. */
const SelectInvoiceKindFilterItem = () => {
  const { t } = useTranslation('payment');

  return (
    <Filter.Item value="kind">
      <IconWallet />
      {t('kind')}
    </Filter.Item>
  );
};

/** Filter popover view that binds the kind selection to the `kind` query param. */
const SelectInvoiceKindFilterView = () => {
  const [kind, setKind] = useFilterQueryState<string>(
    'kind',
    INVOICES_CURSOR_SESSION_KEY,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="kind">
      <SelectInvoiceKindContent
        value={kind || ''}
        onValueChange={(value) => {
          setKind(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

/** Filter bar chip showing the selected kind with a popover to change it. */
const SelectInvoiceKindFilterBar = () => {
  const [kind, setKind] = useFilterQueryState<string>(
    'kind',
    INVOICES_CURSOR_SESSION_KEY,
  );
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('payment');

  const kindLabel = kind
    ? (PAYMENT_KINDS[kind as keyof typeof PAYMENT_KINDS]?.name ?? kind)
    : undefined;

  return (
    <Filter.BarItem queryKey="kind">
      <Filter.BarName>
        <IconWallet />
        {t('kind')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="kind">{kindLabel}</Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectInvoiceKindContent
            value={kind || ''}
            onValueChange={(value) => {
              setKind(value || null);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

/** Compound component for filtering invoices by payment kind. */
export const SelectInvoiceKind = {
  Content: SelectInvoiceKindContent,
  FilterItem: SelectInvoiceKindFilterItem,
  FilterView: SelectInvoiceKindFilterView,
  FilterBar: SelectInvoiceKindFilterBar,
};
