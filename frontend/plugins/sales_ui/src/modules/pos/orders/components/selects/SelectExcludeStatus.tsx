import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  Form,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';

import { IconBan } from '@tabler/icons-react';
import { EXCLUDE_STATUS_DATA } from '../../constants/excludeStatusData';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

interface IExcludeStatus {
  value: string;
  label: string;
}

interface SelectExcludeStatusContextType {
  value: string;
  onValueChange: (excludeStatus: string) => void;
  excludeStatuses?: IExcludeStatus[];
}

const SelectExcludeStatusContext =
  createContext<SelectExcludeStatusContextType | null>(null);

const useSelectExcludeStatusContext = () => {
  const context = useContext(SelectExcludeStatusContext);
  if (!context) {
    throw new Error(
      'useSelectExcludeStatusContext must be used within SelectExcludeStatusProvider',
    );
  }
  return context;
};

export const SelectExcludeStatusProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (excludeStatus: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const excludeStatuses = EXCLUDE_STATUS_DATA;

  const handleValueChange = useCallback(
    (excludeStatus: string) => {
      if (!excludeStatus) return;
      onValueChange?.(excludeStatus);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value:
        mode === 'single'
          ? (value as string) || ''
          : (value as string[]).join(','),
      onValueChange: handleValueChange,
      excludeStatuses,
    }),
    [value, handleValueChange, excludeStatuses, mode],
  );

  return (
    <SelectExcludeStatusContext.Provider value={contextValue}>
      {children}
    </SelectExcludeStatusContext.Provider>
  );
};

const SelectExcludeStatusValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, excludeStatuses } = useSelectExcludeStatusContext();
  const selectedExcludeStatus = excludeStatuses?.find(
    (type) => type.value === value,
  );

  if (!selectedExcludeStatus) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select exclude status'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedExcludeStatus.label}
      </p>
    </div>
  );
};

const SelectExcludeStatusCommandItem = ({
  excludeStatus,
}: {
  excludeStatus: IExcludeStatus;
}) => {
  const { onValueChange, value } = useSelectExcludeStatusContext();
  const { value: excludeStatusValue, label } = excludeStatus || {};

  return (
    <Command.Item
      value={excludeStatusValue}
      onSelect={() => {
        onValueChange(excludeStatusValue);
      }}
    >
      <span className="font-medium">{label}</span>
      <Combobox.Check checked={value === excludeStatusValue} />
    </Command.Item>
  );
};

const SelectExcludeStatusContent = () => {
  const { excludeStatuses } = useSelectExcludeStatusContext();

  return (
    <Command>
      <Command.Input placeholder="Search exclude status" />
      <Command.Empty>
        <span className="text-muted-foreground">No exclude statuses found</span>
      </Command.Empty>
      <Command.List>
        {excludeStatuses?.map((excludeStatus) => (
          <SelectExcludeStatusCommandItem
            key={excludeStatus.value}
            excludeStatus={excludeStatus}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectExcludeStatusFilterItem = () => {
  return (
    <Filter.Item value="excludeStatus">
      <IconBan />
      Exclude Status
    </Filter.Item>
  );
};

export const SelectExcludeStatusFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [excludeStatus, setExcludeStatus] = useQueryState<string[] | string>(
    queryKey || 'excludeStatus',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'excludeStatus'}>
      <SelectExcludeStatusProvider
        mode={mode}
        value={excludeStatus || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setExcludeStatus(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectExcludeStatusContent />
      </SelectExcludeStatusProvider>
    </Filter.View>
  );
};

export const SelectExcludeStatusFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [excludeStatus, setExcludeStatus] = useQueryState<string[] | string>(
    'excludeStatus',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'excludeStatus'}>
      <Filter.BarName>
        <IconBan />
        Exclude Status
      </Filter.BarName>
      <SelectExcludeStatusProvider
        mode={mode}
        value={excludeStatus || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setExcludeStatus(value as string[] | string);
          } else {
            setExcludeStatus(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'excludeStatus'}>
              <SelectExcludeStatusValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectExcludeStatusContent />
          </Combobox.Content>
        </Popover>
      </SelectExcludeStatusProvider>
    </Filter.BarItem>
  );
};

export const SelectExcludeStatusFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<
  React.ComponentProps<typeof SelectExcludeStatusProvider>,
  'children'
> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectExcludeStatusProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectExcludeStatusValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectExcludeStatusContent />
        </Combobox.Content>
      </Popover>
    </SelectExcludeStatusProvider>
  );
};

SelectExcludeStatusFormItem.displayName = 'SelectExcludeStatusFormItem';

const SelectExcludeStatusRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant?: SelectTriggerVariantType;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectExcludeStatusProvider
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectExcludeStatusValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectExcludeStatusContent />
        </SelectContent>
      </PopoverScoped>
    </SelectExcludeStatusProvider>
  );
};

export const SelectExcludeStatus = Object.assign(SelectExcludeStatusRoot, {
  Provider: SelectExcludeStatusProvider,
  Value: SelectExcludeStatusValue,
  Content: SelectExcludeStatusContent,
  FilterItem: SelectExcludeStatusFilterItem,
  FilterView: SelectExcludeStatusFilterView,
  FilterBar: SelectExcludeStatusFilterBar,
  FormItem: SelectExcludeStatusFormItem,
});
