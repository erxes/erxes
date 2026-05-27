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
];

interface SelectOwnerTypeContextType {
  value: string;
  onValueChange: (val: string) => void;
}

const SelectOwnerTypeContext = createContext<SelectOwnerTypeContextType | null>(
  null,
);

const useCtx = () => {
  const ctx = useContext(SelectOwnerTypeContext);
  if (!ctx)
    throw new Error('useCtx must be used within SelectOwnerTypeProvider');
  return ctx;
};

const Provider = ({
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

const Value = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value } = useCtx();
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

const Content = () => {
  const { value, onValueChange } = useCtx();

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

const FilterItem = ({ queryKey }: { queryKey: string }) => (
  <Filter.Item value={queryKey}>
    <IconUsers />
    Owner Type
  </Filter.Item>
);

const FilterView = ({ queryKey }: { queryKey: string }) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <Provider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val);
          resetFilterState();
        }}
      >
        <Content />
      </Provider>
    </Filter.View>
  );
};

const FilterBar = ({ queryKey }: { queryKey: string }) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconUsers />
        Owner Type
      </Filter.BarName>
      <Provider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val || null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey}>
              <Value />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <Content />
          </Combobox.Content>
        </Popover>
      </Provider>
    </Filter.BarItem>
  );
};

const FormItem = ({
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
    <Provider
      value={value}
      onValueChange={(val) => {
        onValueChange(val);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <Value placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <Content />
        </Combobox.Content>
      </Popover>
    </Provider>
  );
};

const Root = ({
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Provider
      value={value}
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className={cn('shadow-xs', className)}>
          <Value placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <Content />
        </Combobox.Content>
      </Popover>
    </Provider>
  );
};

export const SelectOwnerTypeShared = Object.assign(Root, {
  Provider,
  Value,
  Content,
  FilterItem,
  FilterView,
  FilterBar,
  FormItem,
});
