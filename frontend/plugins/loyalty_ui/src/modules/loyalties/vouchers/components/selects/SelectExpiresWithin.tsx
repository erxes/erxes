import { IconHourglassLow } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Unused or held vouchers ending within this many days.
const DAY_OPTIONS = ['1', '3', '7', '30'];
const QUERY_KEY = 'expiresWithin';

const ExpiresWithinOptions = ({
  value,
  onSelect,
}: {
  value?: string | null;
  onSelect: (days: string) => void;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <Command>
      <Command.List>
        {DAY_OPTIONS.map((days) => (
          <Command.Item key={days} value={days} onSelect={() => onSelect(days)}>
            {t('voucher-expires-within-option', { count: Number(days) })}
            <Combobox.Check checked={value === days} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const SelectExpiresWithinFilterItem = () => {
  const { t } = useTranslation('loyalty');

  return (
    <Filter.Item value={QUERY_KEY}>
      <IconHourglassLow />
      {t('voucher-expires-within')}
    </Filter.Item>
  );
};

const SelectExpiresWithinFilterView = () => {
  const [days, setDays] = useQueryState<string>(QUERY_KEY);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={QUERY_KEY}>
      <ExpiresWithinOptions
        value={days}
        onSelect={(next) => {
          setDays(next);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const SelectExpiresWithinFilterBar = () => {
  const { t } = useTranslation('loyalty');
  const [days, setDays] = useQueryState<string>(QUERY_KEY);
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={QUERY_KEY}>
      <Filter.BarName>
        <IconHourglassLow />
        {t('voucher-expires-within')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={QUERY_KEY}>
            {days
              ? t('voucher-expires-within-option', { count: Number(days) })
              : ''}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <ExpiresWithinOptions
            value={days}
            onSelect={(next) => {
              setDays(next);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const SelectExpiresWithin = {
  FilterItem: SelectExpiresWithinFilterItem,
  FilterView: SelectExpiresWithinFilterView,
  FilterBar: SelectExpiresWithinFilterBar,
};
