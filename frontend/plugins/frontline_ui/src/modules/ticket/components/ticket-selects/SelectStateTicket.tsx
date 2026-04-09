import React, { useState } from 'react';
import {
  Combobox,
  Command,
  Filter,
  PopoverScoped,
  useQueryState,
  useFilterContext,
} from 'erxes-ui';
import { IconCircleCheck, IconArchive, IconTrash } from '@tabler/icons-react';
import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';

interface SelectStateContextType {
  value: string;
  onValueChange: (state: string) => void;
  variant?: `${SelectTriggerVariant}`;
}

const SelectStateContext = React.createContext<SelectStateContextType | null>(
  null,
);

const useSelectStateContext = () => {
  const context = React.useContext(SelectStateContext);
  if (!context) {
    throw new Error(
      'useSelectStateContext must be used within SelectStateProvider',
    );
  }
  return context;
};

const STATES = [
  { value: 'active', label: 'Active', icon: IconCircleCheck },
  { value: 'archived', label: 'Archived', icon: IconArchive },
  { value: 'deleted', label: 'Deleted', icon: IconTrash },
];

const SelectStateProvider = ({
  children,
  value = '',
  onValueChange,
  variant,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange: (state: string) => void;
  variant?: `${SelectTriggerVariant}`;
}) => {
  return (
    <SelectStateContext.Provider value={{ value, onValueChange, variant }}>
      {children}
    </SelectStateContext.Provider>
  );
};

const SelectStateValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useSelectStateContext();
  const selected = STATES.find((s) => s.value === value);

  if (!selected) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select state'}
      </span>
    );
  }

  const Icon = selected.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4" />
      <span className="font-medium text-sm">{selected.label}</span>
    </div>
  );
};

const SelectStateCommandItem = ({
  state,
}: {
  state: (typeof STATES)[number];
}) => {
  const { onValueChange, value } = useSelectStateContext();
  const Icon = state.icon;

  return (
    <Command.Item
      value={state.value}
      onSelect={() => onValueChange(state.value)}
    >
      <div className="flex items-center gap-2 flex-1">
        <Icon className="size-4" />
        <span className="font-medium capitalize">{state.label}</span>
      </div>
      <Combobox.Check checked={value === state.value} />
    </Command.Item>
  );
};

const SelectStateContent = () => {
  return (
    <Command>
      <Command.Input placeholder="Search state" />
      <Command.Empty>No state found</Command.Empty>
      <Command.List>
        {STATES.map((state) => (
          <SelectStateCommandItem key={state.value} state={state} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectStateTicketRoot = ({
  value,
  onValueChange,
  scope,
  variant,
  id,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  scope?: string;
  variant: `${SelectTriggerVariant}`;
  id?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTicket } = useUpdateTicket();

  const handleChange = (val: string) => {
    if (id) {
      updateTicket({
        variables: {
          _id: id,
          state: val,
        },
      });
    }

    onValueChange?.(val);
    setOpen(false);
  };

  return (
    <SelectStateProvider
      value={value}
      onValueChange={handleChange}
      variant={variant}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant={variant}>
          <SelectStateValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectStateContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStateProvider>
  );
};

const SelectStateFilterView = () => {
  const [state, setState] = useQueryState<string>('state');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="state">
      <SelectStateProvider
        value={state || ''}
        onValueChange={(value) => {
          setState(value);
          resetFilterState();
        }}
      >
        <SelectStateContent />
      </SelectStateProvider>
    </Filter.View>
  );
};

const SelectStateTicketFilterBar = ({ scope }: { scope?: string }) => {
  const [state, setState] = useQueryState<string>('state');
  const [open, setOpen] = useState(false);

  return (
    <SelectStateProvider
      value={state || ''}
      onValueChange={(value) => {
        setState(value);
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="filter">
          <SelectStateValue placeholder="State" />
        </SelectTriggerTicket>
        <SelectTicketContent variant="filter">
          <SelectStateContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStateProvider>
  );
};

const SelectStateFormItem = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectStateProvider
      value={value}
      onValueChange={(val) => {
        onValueChange(val);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectStateValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectStateContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStateProvider>
  );
};

export const SelectStateTicket = Object.assign(SelectStateTicketRoot, {
  FilterBar: SelectStateTicketFilterBar,
  FormItem: SelectStateFormItem,
  FilterView: SelectStateFilterView,
});
