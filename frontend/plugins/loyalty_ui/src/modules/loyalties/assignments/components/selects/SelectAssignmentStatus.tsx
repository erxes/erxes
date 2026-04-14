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

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'won', label: 'Won' },
  { value: 'loss', label: 'Loss' },
];

export const SelectAssignmentStatusFilterItem = () => (
  <Filter.Item value="assignmentStatus">
    <IconToggleLeft />
    Status
  </Filter.Item>
);

export const SelectAssignmentStatusFilterView = () => {
  const [value, setValue] = useQueryState<string>('assignmentStatus');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="assignmentStatus">
      <Command>
        <Command.List>
          {STATUS_OPTIONS.map((opt) => (
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

export const SelectAssignmentStatusFilterBar = () => {
  const [value, setValue] = useQueryState<string>('assignmentStatus');
  const [open, setOpen] = useState(false);
  const selected = STATUS_OPTIONS.find((o) => o.value === value);

  return (
    <Filter.BarItem queryKey="assignmentStatus">
      <Filter.BarName>
        <IconToggleLeft />
        Status
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="assignmentStatus">
            <span>{selected?.label || 'Status'}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.List>
              {STATUS_OPTIONS.map((opt) => (
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
