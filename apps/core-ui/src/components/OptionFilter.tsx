import { z } from 'zod';
import { IconCheck } from '@tabler/icons-react';
import { Command, Filter, useFilterContext, useFilterQueryState } from 'erxes-ui';
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
    const { sessionKey } = useFilterContext();
    const [value, setValue] = useFilterQueryState(filterKey, z.string(), sessionKey);

    return (
      <Filter.View filterKey={filterKey}>
        <Command>
          <Command.List className="p-1">
            {options.map((option) => (
              <Filter.CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => setValue(option.value)}
              >
                {option.label}
                {value === option.value && <IconCheck className="ml-auto size-4 text-primary" />}
              </Filter.CommandItem>
            ))}
          </Command.List>
        </Command>
      </Filter.View>
    );
  },
  Bar: ({ filterKey, label, icon: Icon, options }: OptionFilterProps) => {
    const { sessionKey } = useFilterContext();
    const [value] = useFilterQueryState(filterKey, z.string(), sessionKey);

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
