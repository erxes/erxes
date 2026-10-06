import {
  BroadcastSelectValueProvider,
  useBroadcastSelectValue,
} from '@/broadcast/context/BroadcastSelectValueContext';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type TFilterOption = { value: string; labelKey: string };

/**
 * One picker over a fixed list, as the campaign filter shows it: a view inside
 * the filter popover and a button on the filter bar. The method and status
 * filters are the same control over different options.
 */
export const createBroadcastFilterSelect = ({
  queryKey,
  options,
  labels = options,
  placeholderKey,
  emptyKey,
}: {
  queryKey: string;
  /** What can be picked. */
  options: TFilterOption[];
  /** What a value already in the URL is named by, when that is wider. */
  labels?: TFilterOption[];
  placeholderKey: string;
  emptyKey: string;
}) => {
  const SelectedValue = () => {
    const { t } = useTranslation('broadcasts');
    const { value } = useBroadcastSelectValue();
    const option = labels.find((item) => item.value === value);

    if (!option) {
      return (
        <span className="text-accent-foreground/80">{t(placeholderKey)}</span>
      );
    }

    return <>{t(option.labelKey)}</>;
  };

  const OptionList = () => {
    const { t } = useTranslation('broadcasts');
    const { value, onValueChange } = useBroadcastSelectValue();

    return (
      <Command>
        <Command.Input placeholder={t(placeholderKey)} />
        <Command.List>
          <Command.Empty>{t(emptyKey)}</Command.Empty>
          {options.map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              // Picking the chosen one again clears it.
              onSelect={() =>
                onValueChange(value === option.value ? '' : option.value)
              }
            >
              {t(option.labelKey)}
              <Combobox.Check checked={value === option.value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    );
  };

  const FilterView = () => {
    const [value, setValue] = useQueryState<string>(queryKey);
    const { resetFilterState } = useFilterContext();

    return (
      <Filter.View filterKey={queryKey}>
        <BroadcastSelectValueProvider
          value={value ?? undefined}
          onValueChange={(next) => {
            setValue(next);
            resetFilterState();
          }}
        >
          <OptionList />
        </BroadcastSelectValueProvider>
      </Filter.View>
    );
  };

  const FilterBar = () => {
    const [value, setValue] = useQueryState<string>(queryKey);
    const [open, setOpen] = useState(false);

    return (
      <BroadcastSelectValueProvider
        value={value ?? undefined}
        onValueChange={(next) => {
          setValue(next);
          setOpen(false);
        }}
      >
        <PopoverScoped open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey}>
              <SelectedValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <OptionList />
          </Combobox.Content>
        </PopoverScoped>
      </BroadcastSelectValueProvider>
    );
  };

  return { FilterView, FilterBar };
};
