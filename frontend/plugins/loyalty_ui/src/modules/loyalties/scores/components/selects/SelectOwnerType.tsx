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
  Form,
  Popover,
  PopoverScoped,
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
  { value: 'unknown', label: 'Unknown' },
];

interface SelectOwnerTypeContextType {
  value: string;
  onValueChange: (val: string) => void;
}

const SelectOwnerTypeContext = createContext<SelectOwnerTypeContextType | null>(
  null,
);

const useSelectOwnerTypeContext = () => {
  const ctx = useContext(SelectOwnerTypeContext);
  if (!ctx)
    throw new Error(
      'useSelectOwnerTypeContext must be used within SelectOwnerTypeProvider',
    );
  return ctx;
};

export const SelectOwnerTypeProvider = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}) => {
  const handleChange = useCallback(
    (val: string) => {
      if (!val) return;
      onValueChange(val);
    },
    [onValueChange],
  );

  const ctx = useMemo(
    () => ({ value: value || '', onValueChange: handleChange }),
    [value, handleChange],
  );

  return (
    <SelectOwnerTypeContext.Provider value={ctx}>
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
  const selected = OWNER_TYPE_OPTIONS.find((o) => o.value === value);

  if (!selected) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select owner type'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>{selected.label}</p>
    </div>
  );
};

const SelectOwnerTypeContent = () => {
  const { value, onValueChange } = useSelectOwnerTypeContext();

  return (
    <Command>
      <Command.Input placeholder="Search owner types..." />
      <Command.Empty>
        <span className="text-muted-foreground">No owner types found</span>
      </Command.Empty>
      <Command.List>
        {OWNER_TYPE_OPTIONS.map((opt) => (
          <Command.Item
            key={opt.value}
            value={opt.value}
            onSelect={() => onValueChange(opt.value)}
          >
            <span className="font-medium">{opt.label}</span>
            <Combobox.Check checked={value === opt.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectOwnerTypeFilterItem = () => (
  <Filter.Item value="scoreOwnerType">
    <IconUsers />
    Owner Type
  </Filter.Item>
);

export const SelectOwnerTypeFilterView = ({
  queryKey = 'scoreOwnerType',
}: {
  queryKey?: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <SelectOwnerTypeProvider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val);
          resetFilterState();
        }}
      >
        <SelectOwnerTypeContent />
      </SelectOwnerTypeProvider>
    </Filter.View>
  );
};

export const SelectOwnerTypeFilterBar = ({
  iconOnly,
}: {
  iconOnly?: boolean;
}) => {
  const [value, setValue] = useQueryState<string>('scoreOwnerType');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="scoreOwnerType">
      <Filter.BarName>
        <IconUsers />
        {!iconOnly && 'Owner Type'}
      </Filter.BarName>
      <SelectOwnerTypeProvider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val || null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="scoreOwnerType">
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
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectOwnerTypeProvider
      value={value}
      onValueChange={(val) => {
        onValueChange(val);
        setOpen(false);
      }}
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
  onValueChange?: (val: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectOwnerTypeProvider
      value={value}
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
    >
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
