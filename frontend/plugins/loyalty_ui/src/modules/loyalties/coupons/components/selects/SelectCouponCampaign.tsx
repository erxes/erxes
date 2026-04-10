import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconTag } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { QUERY_COUPON_CAMPAIGNS } from '../../graphql/queries/queries';

interface CouponCampaignOption {
  value: string;
  label: string;
}

const useCouponCampaignOptions = () => {
  const { data, loading } = useQuery(QUERY_COUPON_CAMPAIGNS, {
    variables: { perPage: 50 },
  });

  const options = useMemo<CouponCampaignOption[]>(
    () =>
      (data?.couponCampaigns?.list || []).map(
        (c: { _id: string; title: string }) => ({
          value: c._id,
          label: c.title,
        }),
      ),
    [data?.couponCampaigns?.list],
  );

  return { options, loading };
};

export const SelectCouponCampaignFilterItem = () => (
  <Filter.Item value="couponCampaignId">
    <IconTag />
    Campaign
  </Filter.Item>
);

export const SelectCouponCampaignFilterView = ({
  queryKey = 'couponCampaignId',
}: {
  queryKey?: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();
  const { options } = useCouponCampaignOptions();

  return (
    <Filter.View filterKey={queryKey}>
      <Command>
        <Command.Input placeholder="Search campaigns..." />
        <Command.Empty>No campaigns found</Command.Empty>
        <Command.List>
          {options.map((opt) => (
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

export const SelectCouponCampaignFilterBar = () => {
  const [value, setValue] = useQueryState<string>('couponCampaignId');
  const [open, setOpen] = useState(false);
  const { options } = useCouponCampaignOptions();
  const selected = options.find((o) => o.value === value);

  return (
    <Filter.BarItem queryKey="couponCampaignId">
      <Filter.BarName>
        <IconTag />
        Campaign
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="couponCampaignId">
            <span>{selected?.label || 'Campaign'}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.Input placeholder="Search..." />
            <Command.List>
              {options.map((opt) => (
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

export const SelectCouponCampaignFormItem = ({
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { options, loading } = useCouponCampaignOptions();
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className={cn('w-full shadow-xs', className)} disabled={loading}>
          <span className={selected ? '' : 'text-muted-foreground'}>
            {selected?.label || placeholder || 'Choose coupon campaign'}
          </span>
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search campaigns..." />
          <Command.Empty>No campaigns found</Command.Empty>
          <Command.List>
            {options.map((opt) => (
              <Command.Item
                key={opt.value}
                value={opt.value}
                onSelect={() => {
                  onValueChange(opt.value);
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
  );
};
