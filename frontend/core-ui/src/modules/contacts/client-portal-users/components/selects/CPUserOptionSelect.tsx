import { Icon } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useFilterQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type CPUserFilterOption = { value: string; label: string };

const CPUserOptionList = ({
  options,
  value,
  onSelect,
}: {
  options: CPUserFilterOption[];
  value?: string | null;
  onSelect: (value: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'filter' });

  return (
    <Command>
      <Command.Input
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder={t('search')}
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty />
        {options.map((option) => (
          <Command.Item
            key={option.value}
            value={option.label}
            onSelect={() => onSelect(option.value)}
          >
            {option.label}
            <Combobox.Check checked={value === option.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const CPUserOptionFilterView = ({
  queryKey,
  options,
}: {
  queryKey: string;
  options: CPUserFilterOption[];
}) => {
  const { resetFilterState, sessionKey } = useFilterContext();
  const [value, setValue] = useFilterQueryState<string>(queryKey, sessionKey);

  return (
    <Filter.View filterKey={queryKey}>
      <CPUserOptionList
        options={options}
        value={value}
        onSelect={(next) => {
          setValue(next === value ? null : next);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const CPUserOptionFilterBar = ({
  queryKey,
  label,
  Icon,
  options,
}: {
  queryKey: string;
  label: string;
  Icon: Icon;
  options: CPUserFilterOption[];
}) => {
  const { sessionKey } = useFilterContext();
  const [value, setValue] = useFilterQueryState<string>(queryKey, sessionKey);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <Icon />
        {label}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={queryKey}>
            {selected?.label ?? value}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <CPUserOptionList
            options={options}
            value={value}
            onSelect={(next) => {
              setValue(next === value ? null : next);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
