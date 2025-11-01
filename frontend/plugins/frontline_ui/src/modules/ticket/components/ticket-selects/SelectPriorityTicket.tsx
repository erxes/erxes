import React, { useState } from 'react';
import {
  Combobox,
  Command,
  Filter,
  PopoverScoped,
  useQueryState,
} from 'erxes-ui';
import { PROJECT_PRIORITIES_OPTIONS } from '@/ticket/constants/priorityOption';
import {
  PriorityBadge,
  PriorityIcon,
  PriorityTitle,
} from '@/ticket/components/ticket-selects/PriorityInline';
import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import clsx from 'clsx';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';

interface SelectPriorityContextType {
  value: number;
  onValueChange: (value: number) => void;
  variant?: `${SelectTriggerVariant}`;
}

const SelectPriorityContext =
  React.createContext<SelectPriorityContextType | null>(null);

const useSelectPriorityContext = () => {
  const context = React.useContext(SelectPriorityContext);
  if (!context) {
    throw new Error(
      'useSelectPriorityContext must be used within SelectPriorityProvider',
    );
  }
  return context;
};

const SelectPriorityProvider = ({
  children,
  value = 0,
  onValueChange,
  variant,
}: {
  children: React.ReactNode;
  value?: number;
  onValueChange: (value: number) => void;
  variant?: `${SelectTriggerVariant}`;
}) => {
  return (
    <SelectPriorityContext.Provider
      value={{
        value,
        onValueChange,
        variant,
      }}
    >
      {children}
    </SelectPriorityContext.Provider>
  );
};

const SelectPriorityBadgeValue = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  const { value } = useSelectPriorityContext();

  if (!value) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select priority'}
      </span>
    );
  }

  return <PriorityBadge priority={value} />;
};

const SelectPriorityValue = () => {
  const { value } = useSelectPriorityContext();

  return (
    <>
      <PriorityIcon priority={value} />
      <PriorityTitle priority={value} />
    </>
  );
};

const SelectPriorityCommandItem = ({ priority }: { priority: number }) => {
  const { onValueChange, value } = useSelectPriorityContext();
  const priorityLabel = PROJECT_PRIORITIES_OPTIONS[priority];
  return (
    <Command.Item
      value={clsx(priorityLabel, value)}
      onSelect={() => onValueChange(priority)}
    >
      <div className="flex items-center gap-2 flex-1">
        <PriorityIcon priority={priority} />
        <PriorityTitle priority={priority} />
      </div>
      <Combobox.Check checked={value === priority} />
    </Command.Item>
  );
};

const SelectPriorityContent = () => {
  return (
    <Command>
      <Command.Input placeholder="Search priority" />
      <Command.Empty>No priority found</Command.Empty>
      <Command.List>
        {PROJECT_PRIORITIES_OPTIONS.map((priority, index) => (
          <SelectPriorityCommandItem key={priority} priority={index} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectPriorityRoot = ({
  value,
  onValueChange,
  scope,
  variant,
  id,
}: {
  value?: number;
  onValueChange?: (value: number) => void;
  scope?: string;
  variant: `${SelectTriggerVariant}`;
  id?: string;
}) => {
  const { updateTicket } = useUpdateTicket();
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: number) => {
    if (id) {
      updateTicket({
        variables: {
          _id: id,
          priority: value,
        },
      });
    }
    onValueChange?.(value);
    setOpen(false);
  };
  return (
    <SelectPriorityProvider
      value={value}
      onValueChange={handleValueChange}
      variant={variant}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant={variant}>
          {variant === SelectTriggerVariant.TABLE ? (
            <SelectPriorityBadgeValue />
          ) : (
            <SelectPriorityValue />
          )}
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectPriorityContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectPriorityProvider>
  );
};

const SelectPriorityFilterView = () => {
  const [priority, setPriority] = useQueryState<string>('priority');
  return (
    <Filter.View filterKey="priority">
      <SelectPriorityProvider
        value={Number(priority)}
        onValueChange={(value) => setPriority(String(value))}
      >
        <SelectPriorityContent />
      </SelectPriorityProvider>
    </Filter.View>
  );
};

const SelectPriorityFilterBar = ({ scope }: { scope?: string }) => {
  const [priority, setPriority] = useQueryState<string>('priority');
  const [open, setOpen] = useState(false);
  return (
    <SelectPriorityProvider
      value={Number(priority)}
      onValueChange={(value) => {
        setPriority(String(value));
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="filter">
          <SelectPriorityValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant="filter">
          <SelectPriorityContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectPriorityProvider>
  );
};

export const SelectPriorityFormItem = ({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectPriorityProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectPriorityValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectPriorityContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectPriorityProvider>
  );
};

export const SelectPriorityTicket = Object.assign(SelectPriorityRoot, {
  FilterBar: SelectPriorityFilterBar,
  FormItem: SelectPriorityFormItem,
  FilterView: SelectPriorityFilterView,
});
