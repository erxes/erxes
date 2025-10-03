import React, { useState } from 'react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';

import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import {
  StatusInlineIcon,
  StatusInlineLabel,
} from '@/operation/components/StatusInline';
import { STATUS_TYPE_LABELS } from '@/operation/constants/statusConstants';
interface SelectStatusContextType {
  value?: number;
  onValueChange: (value: number) => void;
  variant?: `${SelectTriggerVariant}`;
}

const SelectStatusContext = React.createContext<SelectStatusContextType | null>(
  null,
);

const useSelectStatusContext = () => {
  const context = React.useContext(SelectStatusContext);
  if (!context) {
    throw new Error(
      'useSelectStatusContext must be used within SelectStatusProvider',
    );
  }
  return context;
};

export const SelectStatusProvider = ({
  children,
  value,
  onValueChange,
  variant,
}: {
  children: React.ReactNode;
  value?: number;
  onValueChange: (value: number) => void;
  variant?: `${SelectTriggerVariant}`;
}) => {
  const handleValueChange = (value: number) => {
    if (!value) return;
    onValueChange(value);
  };

  return (
    <SelectStatusContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        variant,
      }}
    >
      {children}
    </SelectStatusContext.Provider>
  );
};

const SelectStatusValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useSelectStatusContext();

  if (!value) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select status...'}
      </span>
    );
  }

  return (
    <>
      <StatusInlineIcon statusType={value} />
      <StatusInlineLabel statusType={value} />
    </>
  );
};

const SelectStatusCommandItem = ({ status }: { status: number }) => {
  const { onValueChange, value } = useSelectStatusContext();

  return (
    <Command.Item
      value={STATUS_TYPE_LABELS[status - 1] + ' ' + status.toString()}
      onSelect={() => {
        onValueChange(status);
      }}
    >
      <div className="flex items-center gap-2 flex-1">
        <StatusInlineIcon
          statusType={status}
          className="w-4 h-4"
          stroke={1.8}
        />
        <span className="font-medium">
          <StatusInlineLabel statusType={status} />
        </span>
      </div>
      <Combobox.Check checked={value === status} />
    </Command.Item>
  );
};

const SelectStatusContent = () => {
  return (
    <Command id="status-command-menu">
      <Command.Input placeholder="Search status" />
      <Command.List>
        <Command.Empty>No status found</Command.Empty>
        {STATUS_TYPE_LABELS.map((status, index) => (
          <SelectStatusCommandItem key={status} status={index + 1} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectStatusFilterView = () => {
  const [status, setStatus] = useQueryState<number>('status');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="status">
      <SelectStatusProvider
        value={status as number}
        onValueChange={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      >
        <SelectStatusContent />
      </SelectStatusProvider>
    </Filter.View>
  );
};

const SelectStatusFilterBar = () => {
  const [status, setStatus] = useQueryState<number>('status');
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusProvider
      value={status as number}
      onValueChange={(value) => {
        setStatus(value as number);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="status">
            <SelectStatusValue />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

const SelectStatusRoot = ({
  value,
  variant,
  scope,
  onValueChange,
}: {
  value?: number;
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: number) => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: number) => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <SelectStatusProvider
      value={value}
      onValueChange={handleValueChange}
      variant={variant}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant}>
          <SelectStatusValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectStatusContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

const SelectStatusFormItem = ({
  value,
  onValueChange,
}: {
  value?: number;
  onValueChange: (value: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectStatusProvider value={value} onValueChange={onValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="form">
          <SelectStatusValue />
        </SelectTriggerOperation>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatus = Object.assign(SelectStatusRoot, {
  FilterView: SelectStatusFilterView,
  FilterBar: SelectStatusFilterBar,
  FormItem: SelectStatusFormItem,
});
