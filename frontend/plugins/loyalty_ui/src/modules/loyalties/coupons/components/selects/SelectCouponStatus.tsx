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

const COUPON_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'in_use', label: 'In use' },
  { value: 'done', label: 'Done' },
];

export const SelectCouponStatusFilterItem = () => (
  <Filter.Item value="couponStatus">
    <IconToggleLeft />
    Status
  </Filter.Item>
);

export const SelectCouponStatusFilterView = () => {
  const [value, setValue] = useQueryState<string>('couponStatus');
  const { resetFilterState } = useFilterContext();

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
              {s.label}
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
  const selected = COUPON_STATUSES.find((s) => s.value === value);

  return (
    <Filter.BarItem queryKey="couponStatus">
      <Filter.BarName>
        <IconToggleLeft />
        Status
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="couponStatus">
            <span>{selected?.label || 'Status'}</span>
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
                  {s.label}
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
