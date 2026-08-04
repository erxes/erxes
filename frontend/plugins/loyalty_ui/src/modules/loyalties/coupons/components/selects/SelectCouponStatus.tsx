import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconToggleLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const COUPON_STATUSES = [
  { value: 'new', label: 'new' },
  { value: 'in_use', label: 'in-use' },
  { value: 'done', label: 'done' },
];

export const SelectCouponStatusFilterItem = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Filter.Item value="couponStatus">
      <IconToggleLeft />
      {t('status')}
    </Filter.Item>
  );
};

export const SelectCouponStatusFilterView = () => {
  const [value, setValue] = useQueryState<string>('couponStatus');
  const { resetFilterState } = useFilterContext();
  const { t } = useTranslation('loyalty');

  return (
    <Filter.View filterKey="couponStatus">
      <Command>
        <Command.List>
          {COUPON_STATUSES.map((s) => (
            <Command.Item
              key={s.value}
              value={s.value}
              onSelect={() => {
                setValue(s.value);
                resetFilterState();
              }}
            >
              {t(s.label)}
              <Combobox.Check checked={value === s.value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

export const SelectCouponStatusFilterBar = () => {
  const [value, setValue] = useQueryState<string>('couponStatus');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('loyalty');
  const selected = COUPON_STATUSES.find((s) => s.value === value);

  return (
    <Filter.BarItem queryKey="couponStatus">
      <Filter.BarName>
        <IconToggleLeft />
        {t('status')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="couponStatus">
            <span>{selected ? t(selected.label) : t('status')}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.List>
              {COUPON_STATUSES.map((s) => (
                <Command.Item
                  key={s.value}
                  value={s.value}
                  onSelect={() => {
                    setValue(s.value);
                    setOpen(false);
                  }}
                >
                  {t(s.label)}
                  <Combobox.Check checked={value === s.value} />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
