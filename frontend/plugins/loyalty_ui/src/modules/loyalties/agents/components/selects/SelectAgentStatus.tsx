import { useState } from 'react';
import {
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';

const OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
];

const StatusContent = ({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (v: string) => void;
}) => (
  <Command>
    <Command.Input placeholder="Search..." />
    <Command.Empty>No statuses found</Command.Empty>
    <Command.List>
      {OPTIONS.map((o) => (
        <Command.Item
          key={o.value}
          value={o.value}
          onSelect={() => onSelect(o.value)}
        >
          {o.label}
          <Combobox.Check checked={value === o.value} />
        </Command.Item>
      ))}
    </Command.List>
  </Command>
);

const FilterItem = () => (
  <Filter.Item value="agentStatus">
    <IconCheck />
    Status
  </Filter.Item>
);

const FilterView = ({ queryKey = 'agentStatus' }: { queryKey?: string }) => {
  const [status, setStatus] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey={queryKey}>
      <StatusContent
        value={status || ''}
        onSelect={(v) => {
          setStatus(v);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const FilterBar = () => {
  const [status, setStatus] = useQueryState<string>('agentStatus');
  const [open, setOpen] = useState(false);
  const label = OPTIONS.find((o) => o.value === status)?.label;

  return (
    <Filter.BarItem queryKey="agentStatus">
      <Filter.BarName>
        <IconCheck />
        Status
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="agentStatus">
            <span>{label || 'Select status'}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <StatusContent
            value={status || ''}
            onSelect={(v) => {
              setStatus(v || null);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const FormItem = ({
  value,
  onValueChange,
  placeholder,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const label = OPTIONS.find((o) => o.value === value)?.label;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs">
          <span className={label ? '' : 'text-accent-foreground/80'}>
            {label || placeholder || 'Select status'}
          </span>
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <StatusContent
          value={value}
          onSelect={(v) => {
            onValueChange(v);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

export const SelectAgentStatus = {
  FilterItem,
  FilterView,
  FilterBar,
  FormItem,
};
