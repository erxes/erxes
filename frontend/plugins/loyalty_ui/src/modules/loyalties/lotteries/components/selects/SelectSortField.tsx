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
import { IconSortAscending } from '@tabler/icons-react';

interface SortFieldOption {
  value: string;
  label: string;
}

const SORT_FIELD_OPTIONS: SortFieldOption[] = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'status', label: 'Status' },
  { value: 'ownerType', label: 'Owner Type' },
];

interface SelectSortFieldContextType {
  value: string;
  onValueChange: (sortField: string) => void;
  loading?: boolean;
}

const SelectSortFieldContext = createContext<SelectSortFieldContextType | null>(
  null,
);

const useSelectSortFieldContext = () => {
  const context = useContext(SelectSortFieldContext);
  if (!context) {
    throw new Error(
      'useSelectSortFieldContext must be used within SelectSortFieldProvider',
    );
  }
  return context;
};

export const SelectSortFieldProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (sortField: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const handleValueChange = useCallback(
    (sortField: string) => {
      if (!sortField) return;
      onValueChange?.(sortField);
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
    <SelectSortFieldContext.Provider value={contextValue}>
      {children}
    </SelectSortFieldContext.Provider>
  );
};

const SelectSortFieldValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value } = useSelectSortFieldContext();
  const selectedOption = SORT_FIELD_OPTIONS.find(
    (option) => option.value === value,
  );

  if (!selectedOption) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select sort field'}
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

const SelectSortFieldCommandItem = ({
  option,
}: {
  option: SortFieldOption;
}) => {
  const { onValueChange, value } = useSelectSortFieldContext();
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

const SelectSortFieldContent = () => {
  return (
    <Command>
      <Command.Input placeholder="Search sort fields..." />
      <Command.Empty>
        <span className="text-muted-foreground">No sort fields found</span>
      </Command.Empty>
      <Command.List>
        {SORT_FIELD_OPTIONS.map((option) => (
          <SelectSortFieldCommandItem key={option.value} option={option} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectSortFieldFilterItem = () => {
  return (
    <Filter.Item value="sortField">
      <IconSortAscending />
      Sort Field
    </Filter.Item>
  );
};

export const SelectSortFieldFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [sortField, setSortField] = useQueryState<string[] | string>(
    queryKey || 'sortField',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'sortField'}>
      <SelectSortFieldProvider
        mode={mode}
        value={sortField || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setSortField(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectSortFieldContent />
      </SelectSortFieldProvider>
    </Filter.View>
  );
};

export const SelectSortFieldFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [sortField, setSortField] = useQueryState<string[] | string>(
    'sortField',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="sortField">
      <Filter.BarName>
        <IconSortAscending />
        {!iconOnly && 'Sort Field'}
      </Filter.BarName>
      <SelectSortFieldProvider
        mode={mode}
        value={sortField || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setSortField(value as string[] | string);
          } else {
            setSortField(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="sortField">
              <SelectSortFieldValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectSortFieldContent />
          </Combobox.Content>
        </Popover>
      </SelectSortFieldProvider>
    </Filter.BarItem>
  );
};

export const SelectSortFieldFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectSortFieldProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectSortFieldProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectSortFieldValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectSortFieldContent />
        </Combobox.Content>
      </Popover>
    </SelectSortFieldProvider>
  );
};

SelectSortFieldFormItem.displayName = 'SelectSortFieldFormItem';

const SelectSortFieldRoot = ({
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
    <SelectSortFieldProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger variant={variant} disabled={disabled}>
          <SelectSortFieldValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectSortFieldContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectSortFieldProvider>
  );
};

export const SelectSortField = Object.assign(SelectSortFieldRoot, {
  Provider: SelectSortFieldProvider,
  Value: SelectSortFieldValue,
  Content: SelectSortFieldContent,
  FilterItem: SelectSortFieldFilterItem,
  FilterView: SelectSortFieldFilterView,
  FilterBar: SelectSortFieldFilterBar,
  FormItem: SelectSortFieldFormItem,
});
