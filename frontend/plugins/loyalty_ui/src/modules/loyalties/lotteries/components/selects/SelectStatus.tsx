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
import { IconCheck } from '@tabler/icons-react';

interface StatusOption {
  value: string;
  label: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
];

interface SelectStatusContextType {
  value: string;
  onValueChange: (status: string) => void;
  loading?: boolean;
}

const SelectStatusContext = createContext<SelectStatusContextType | null>(null);

const useSelectStatusContext = () => {
  const context = useContext(SelectStatusContext);
  if (!context) {
    throw new Error(
      'useSelectStatusContext must be used within SelectStatusProvider',
    );
  }
  return context;
};

export const SelectStatusProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (status: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const handleValueChange = useCallback(
    (status: string) => {
      if (!status) return;
      onValueChange?.(status);
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
      loading: false,
    }),
    [value, handleValueChange, mode],
  );

  return (
    <SelectStatusContext.Provider value={contextValue}>
      {children}
    </SelectStatusContext.Provider>
  );
};

const SelectStatusValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value } = useSelectStatusContext();
  const selectedOption = STATUS_OPTIONS.find((option) => option.value === value);

  if (!selectedOption) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select status'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedOption.label}
      </p>
    </div>
  );
};

const SelectStatusCommandItem = ({ option }: { option: StatusOption }) => {
  const { onValueChange, value } = useSelectStatusContext();
  const { value: optionValue, label } = option;
  const isChecked = value.split(',').includes(optionValue);

  return (
    <Command.Item value={optionValue} onSelect={() => onValueChange(optionValue)}>
      <div className="flex items-center gap-2">
        <span className="font-medium">{label}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectStatusContent = () => {
  return (
    <Command>
      <Command.Input placeholder="Search statuses..." />
      <Command.Empty>
        <span className="text-muted-foreground">No statuses found</span>
      </Command.Empty>
      <Command.List>
        {STATUS_OPTIONS.map((option) => (
          <SelectStatusCommandItem key={option.value} option={option} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectStatusFilterItem = () => {
  return (
    <Filter.Item value="status">
      <IconCheck />
      Status
    </Filter.Item>
  );
};

export const SelectStatusFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [status, setStatus] = useQueryState<string[] | string>(
    queryKey || 'status',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'status'}>
      <SelectStatusProvider
        mode={mode}
        value={status || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setStatus(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectStatusContent />
      </SelectStatusProvider>
    </Filter.View>
  );
};

export const SelectStatusFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [status, setStatus] = useQueryState<string[] | string>('status');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconCheck />
        {!iconOnly && 'Status'}
      </Filter.BarName>
      <SelectStatusProvider
        mode={mode}
        value={status || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setStatus(value as string[] | string);
          } else {
            setStatus(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="status">
              <SelectStatusValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectStatusContent />
          </Combobox.Content>
        </Popover>
      </SelectStatusProvider>
    </Filter.BarItem>
  );
};

export const SelectStatusFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectStatusProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectStatusProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectStatusValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </Popover>
    </SelectStatusProvider>
  );
};

SelectStatusFormItem.displayName = 'SelectStatusFormItem';

const SelectStatusRoot = ({
  value,
  variant = 'outline',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant?: 'outline' | 'ghost';
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (val: string) => {
      onValueChange?.(val);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectStatusProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger variant={variant} disabled={disabled}>
          <SelectStatusValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatus = Object.assign(SelectStatusRoot, {
  Provider: SelectStatusProvider,
  Value: SelectStatusValue,
  Content: SelectStatusContent,
  FilterItem: SelectStatusFilterItem,
  FilterView: SelectStatusFilterView,
  FilterBar: SelectStatusFilterBar,
  FormItem: SelectStatusFormItem,
});
