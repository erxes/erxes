import { useState } from 'react';
import { IconWallet } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PAYMENT_KINDS } from '~/modules/payment/constants';

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

const SelectInvoiceKindFilterItem = () => {
  const { t } = useTranslation('payment');

  return (
    <Filter.Item value="kind">
      <IconWallet />
      {t('kind')}
    </Filter.Item>
  );
};

const SelectInvoiceKindFilterView = () => {
  const [kind, setKind] = useQueryState<string>('kind');
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

const SelectInvoiceKindFilterBar = () => {
  const [kind, setKind] = useQueryState<string>('kind');
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

export const SelectInvoiceKind = {
  Content: SelectInvoiceKindContent,
  FilterItem: SelectInvoiceKindFilterItem,
  FilterView: SelectInvoiceKindFilterView,
  FilterBar: SelectInvoiceKindFilterBar,
};
