import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, useQueryState } from 'erxes-ui';

type TOption = {
  readonly value: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
};

/**
 * The three list filters are all "pick one of a fixed set", so they share one
 * implementation rather than three near-identical files.
 */
export const EmailDeliveryChoiceFilter = ({
  queryKey,
  options,
}: {
  queryKey: string;
  options: readonly TOption[];
}) => {
  const [selected, setSelected] = useQueryState<string>(queryKey);

  return (
    <Command shouldFilter={false}>
      <Command.List className="p-1">
        <Combobox.Empty />
        {options.map(({ value, label, icon: Icon }) => (
          <Command.Item
            key={value}
            value={value}
            className="cursor-pointer"
            onSelect={() => setSelected(value === selected ? null : value)}
          >
            <Icon className="size-4" />
            {label}
            {selected === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
