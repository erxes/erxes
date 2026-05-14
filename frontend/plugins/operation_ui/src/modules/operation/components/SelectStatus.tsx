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
  STATUS_TYPES,
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
      value={
        STATUS_TYPE_LABELS[(status - 1) as number] + ' ' + status.toString()
      }
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

const SelectStatusContent = ({
  useExtendedLabels,
}: {
  useExtendedLabels?: boolean;
}) => {
  const visibleStatuses = useExtendedLabels
    ? STATUS_TYPE_LABELS
    : STATUS_TYPE_LABELS.filter(
        (_, index) => index !== STATUS_TYPES.TRIAGE - 1,
      );

  return (
    <Command id="status-command-menu">
      <Command.Input placeholder="Search status" />
      <Command.List>
        <Command.Empty>No status found</Command.Empty>
        {visibleStatuses.map((label) => {
          const originalIndex = STATUS_TYPE_LABELS.indexOf(label);
          return (
            <SelectStatusCommandItem key={label} status={originalIndex + 1} />
          );
        })}
      </Command.List>
    </Command>
  );
};

const SelectStatusFilterView = ({ queryKey }: { queryKey?: string }) => {
  const [status, setStatus] = useQueryState<number>(queryKey || 'status');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'status'}>
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

const SelectStatusFilterBar = ({ queryKey }: { queryKey?: string }) => {
  const [status, setStatus] = useQueryState<number>(queryKey || 'status');
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
          <Filter.BarButton filterKey={queryKey || 'status'}>
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
  useExtendedLabels,
}: {
  value?: number;
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: number) => void;
  useExtendedLabels?: boolean;
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
          <SelectStatusContent useExtendedLabels={useExtendedLabels} />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

const SelectStatusFormItem = ({
  value,
  onValueChange,
  useExtendedLabels = false,
}: {
  value?: number;
  onValueChange: (value: number) => void;
  useExtendedLabels?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectStatusProvider value={value} onValueChange={onValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="form">
          <SelectStatusValue />
        </SelectTriggerOperation>
        <Combobox.Content>
          <SelectStatusContent useExtendedLabels={useExtendedLabels} />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatus = Object.assign(SelectStatusRoot, {
  FilterView: SelectStatusFilterView,
  FilterBar: SelectStatusFilterBar,
  FormItem: SelectStatusFormItem,
  Content: SelectStatusContent,
  Provider: SelectStatusProvider,
});
