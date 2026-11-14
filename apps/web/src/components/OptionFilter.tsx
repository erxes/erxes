import { IconCheck } from '@tabler/icons-react';
import { Command, Filter } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import type { ComponentType } from 'react';

export interface OptionFilterProps {
  filterKey: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  options: { value: string; label: string }[];
}

/** One-of-a-list filter: the popover entry, its option list, and the bar chip. */
export const OptionFilter = {
  Item: ({ filterKey, label, icon: Icon }: OptionFilterProps) => (
    <Filter.Item value={filterKey}>
      <Icon />
      {label}
    </Filter.Item>
  ),
  View: ({ filterKey, options }: OptionFilterProps) => {
    const [value, setValue] = useQueryState(filterKey);

    return (
      <Filter.View filterKey={filterKey}>
        <Command>
          <Command.List>
            {options.map((option) => (
              <Filter.CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => void setValue(option.value)}
              >
                {option.label}
                {value === option.value && (
                  <IconCheck className="ml-auto size-4 text-primary-text" />
                )}
              </Filter.CommandItem>
            ))}
          </Command.List>
        </Command>
      </Filter.View>
    );
  },
  Bar: ({ filterKey, label, icon: Icon, options }: OptionFilterProps) => {
    const [value] = useQueryState(filterKey);

    return (
      <Filter.BarItem queryKey={filterKey}>
        <Filter.BarName>
          <Icon />
          {label}
        </Filter.BarName>
        <Filter.BarButton filterKey={filterKey}>
          {options.find((option) => option.value === value)?.label ?? value}
        </Filter.BarButton>
      </Filter.BarItem>
    );
  },
};
