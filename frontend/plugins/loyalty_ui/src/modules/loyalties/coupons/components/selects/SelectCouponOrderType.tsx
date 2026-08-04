import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconSortAscending } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const COUPON_ORDER_TYPE_OPTIONS = [{ value: 'createdAt', label: 'Date' }];

export const SelectCouponOrderTypeFilterItem = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Filter.Item value="couponSortField">
      <IconSortAscending />
      {t('order-type')}
    </Filter.Item>
  );
};

export const SelectCouponOrderTypeFilterView = () => {
  const [value, setValue] = useQueryState<string>('couponSortField');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="couponSortField">
      <Command>
        <Command.List>
          {COUPON_ORDER_TYPE_OPTIONS.map((opt) => (
            <Command.Item
              key={opt.value}
              value={opt.value}
              onSelect={() => {
                setValue(opt.value);
                resetFilterState();
              }}
            >
              {opt.label}
              <Combobox.Check checked={value === opt.value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

export const SelectCouponOrderTypeFilterBar = () => {
  const [value, setValue] = useQueryState<string>('couponSortField');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('loyalty');
  const selected = COUPON_ORDER_TYPE_OPTIONS.find((o) => o.value === value);

  return (
    <Filter.BarItem queryKey="couponSortField">
      <Filter.BarName>
        <IconSortAscending />
        {t('order-type')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="couponSortField">
            <span>{selected?.label || t('order-type')}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.List>
              {COUPON_ORDER_TYPE_OPTIONS.map((opt) => (
                <Command.Item
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    setValue(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                  <Combobox.Check checked={value === opt.value} />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
