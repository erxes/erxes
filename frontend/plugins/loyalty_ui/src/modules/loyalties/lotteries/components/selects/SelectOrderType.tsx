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
import { IconArrowsSort } from '@tabler/icons-react';

interface OrderTypeOption {
  value: string;
  label: string;
}

const ORDER_TYPE_OPTIONS: OrderTypeOption[] = [
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
];

interface SelectOrderTypeContextType {
  value: string;
  onValueChange: (orderType: string) => void;
  loading?: boolean;
}

const SelectOrderTypeContext = createContext<SelectOrderTypeContextType | null>(
  null,
);

const useSelectOrderTypeContext = () => {
  const context = useContext(SelectOrderTypeContext);
  if (!context) {
    throw new Error(
      'useSelectOrderTypeContext must be used within SelectOrderTypeProvider',
    );
  }
  return context;
};

export const SelectOrderTypeProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (orderType: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const handleValueChange = useCallback(
    (orderType: string) => {
      if (!orderType) return;
      onValueChange?.(orderType);
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
    <SelectOrderTypeContext.Provider value={contextValue}>
      {children}
    </SelectOrderTypeContext.Provider>
  );
};

const SelectOrderTypeValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value } = useSelectOrderTypeContext();
  const selectedOption = ORDER_TYPE_OPTIONS.find(
    (option) => option.value === value,
  );

  if (!selectedOption) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select order type'}
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

const SelectOrderTypeCommandItem = ({
  option,
}: {
  option: OrderTypeOption;
}) => {
  const { onValueChange, value } = useSelectOrderTypeContext();
  const { value: optionValue, label } = option;
  const isChecked = value.split(',').includes(optionValue);

  return (
    <Command.Item
      value={optionValue}
      onSelect={() => onValueChange(optionValue)}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{label}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectOrderTypeContent = () => {
  return (
    <Command>
      <Command.Input placeholder="Search order types..." />
      <Command.Empty>
        <span className="text-muted-foreground">No order types found</span>
      </Command.Empty>
      <Command.List>
        {ORDER_TYPE_OPTIONS.map((option) => (
          <SelectOrderTypeCommandItem key={option.value} option={option} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectOrderTypeFilterItem = () => {
  return (
    <Filter.Item value="orderType">
      <IconArrowsSort />
      Sort Order
    </Filter.Item>
  );
};

export const SelectOrderTypeFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [orderType, setOrderType] = useQueryState<string[] | string>(
    queryKey || 'orderType',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'orderType'}>
      <SelectOrderTypeProvider
        mode={mode}
        value={orderType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setOrderType(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectOrderTypeContent />
      </SelectOrderTypeProvider>
    </Filter.View>
  );
};

export const SelectOrderTypeFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [orderType, setOrderType] = useQueryState<string[] | string>('orderType');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="orderType">
      <Filter.BarName>
        <IconArrowsSort />
        {!iconOnly && 'Sort Order'}
      </Filter.BarName>
      <SelectOrderTypeProvider
        mode={mode}
        value={orderType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setOrderType(value as string[] | string);
          } else {
            setOrderType(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="orderType">
              <SelectOrderTypeValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectOrderTypeContent />
          </Combobox.Content>
        </Popover>
      </SelectOrderTypeProvider>
    </Filter.BarItem>
  );
};

export const SelectOrderTypeFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectOrderTypeProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectOrderTypeProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectOrderTypeValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectOrderTypeContent />
        </Combobox.Content>
      </Popover>
    </SelectOrderTypeProvider>
  );
};

SelectOrderTypeFormItem.displayName = 'SelectOrderTypeFormItem';

const SelectOrderTypeRoot = ({
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
    <SelectOrderTypeProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger variant={variant} disabled={disabled}>
          <SelectOrderTypeValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectOrderTypeContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectOrderTypeProvider>
  );
};

export const SelectOrderType = Object.assign(SelectOrderTypeRoot, {
  Provider: SelectOrderTypeProvider,
  Value: SelectOrderTypeValue,
  Content: SelectOrderTypeContent,
  FilterItem: SelectOrderTypeFilterItem,
  FilterView: SelectOrderTypeFilterView,
  FilterBar: SelectOrderTypeFilterBar,
  FormItem: SelectOrderTypeFormItem,
});
