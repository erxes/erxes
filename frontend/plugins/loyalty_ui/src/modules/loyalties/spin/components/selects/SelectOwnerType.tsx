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
import { IconUsers } from '@tabler/icons-react';

interface OwnerTypeOption {
  value: string;
  label: string;
}

const OWNER_TYPE_OPTIONS: OwnerTypeOption[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'company', label: 'Company' },
  { value: 'user', label: 'Team Member' },
  { value: 'cpUser', label: 'Client Portal User' },
];

interface SelectOwnerTypeContextType {
  value: string;
  onValueChange: (ownerType: string) => void;
  loading?: boolean;
}

const SelectOwnerTypeContext = createContext<SelectOwnerTypeContextType | null>(
  null,
);

const useSelectOwnerTypeContext = () => {
  const context = useContext(SelectOwnerTypeContext);
  if (!context) {
    throw new Error(
      'useSelectOwnerTypeContext must be used within SelectOwnerTypeProvider',
    );
  }
  return context;
};

export const SelectOwnerTypeProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (ownerType: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const handleValueChange = useCallback(
    (ownerType: string) => {
      if (!ownerType) return;
      onValueChange?.(ownerType);
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
    <SelectOwnerTypeContext.Provider value={contextValue}>
      {children}
    </SelectOwnerTypeContext.Provider>
  );
};

const SelectOwnerTypeValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value } = useSelectOwnerTypeContext();
  const selectedOption = OWNER_TYPE_OPTIONS.find(
    (option) => option.value === value,
  );

  if (!selectedOption) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select owner type'}
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

const SelectOwnerTypeCommandItem = ({
  option,
}: {
  option: OwnerTypeOption;
}) => {
  const { onValueChange, value } = useSelectOwnerTypeContext();
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

const SelectOwnerTypeContent = () => {
  return (
    <Command>
      <Command.Input placeholder="Search owner types..." />
      <Command.Empty>
        <span className="text-muted-foreground">No owner types found</span>
      </Command.Empty>
      <Command.List>
        {OWNER_TYPE_OPTIONS.map((option) => (
          <SelectOwnerTypeCommandItem key={option.value} option={option} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectOwnerTypeFilterItem = () => {
  return (
    <Filter.Item value="ownerType">
      <IconUsers />
      Owner Type
    </Filter.Item>
  );
};

export const SelectOwnerTypeFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [ownerType, setOwnerType] = useQueryState<string[] | string>(
    queryKey || 'ownerType',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'ownerType'}>
      <SelectOwnerTypeProvider
        mode={mode}
        value={ownerType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setOwnerType(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectOwnerTypeContent />
      </SelectOwnerTypeProvider>
    </Filter.View>
  );
};

export const SelectOwnerTypeFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [ownerType, setOwnerType] = useQueryState<string[] | string>(
    'ownerType',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="ownerType">
      <Filter.BarName>
        <IconUsers />
        {!iconOnly && 'Owner Type'}
      </Filter.BarName>
      <SelectOwnerTypeProvider
        mode={mode}
        value={ownerType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setOwnerType(value as string[] | string);
          } else {
            setOwnerType(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="ownerType">
              <SelectOwnerTypeValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectOwnerTypeContent />
          </Combobox.Content>
        </Popover>
      </SelectOwnerTypeProvider>
    </Filter.BarItem>
  );
};

export const SelectOwnerTypeFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectOwnerTypeProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectOwnerTypeProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectOwnerTypeValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectOwnerTypeContent />
        </Combobox.Content>
      </Popover>
    </SelectOwnerTypeProvider>
  );
};

SelectOwnerTypeFormItem.displayName = 'SelectOwnerTypeFormItem';

const SelectOwnerTypeRoot = ({
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
    <SelectOwnerTypeProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger variant={variant} disabled={disabled}>
          <SelectOwnerTypeValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectOwnerTypeContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectOwnerTypeProvider>
  );
};

export const SelectOwnerType = Object.assign(SelectOwnerTypeRoot, {
  Provider: SelectOwnerTypeProvider,
  Value: SelectOwnerTypeValue,
  Content: SelectOwnerTypeContent,
  FilterItem: SelectOwnerTypeFilterItem,
  FilterView: SelectOwnerTypeFilterView,
  FilterBar: SelectOwnerTypeFilterBar,
  FormItem: SelectOwnerTypeFormItem,
});
