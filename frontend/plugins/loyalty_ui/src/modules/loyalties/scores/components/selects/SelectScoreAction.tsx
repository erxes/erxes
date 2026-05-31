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
import { IconArrowsExchange } from '@tabler/icons-react';

const ACTION_OPTIONS = [{ value: 'createdAt', label: 'Date' }];

interface SelectScoreActionContextType {
  value: string;
  onValueChange: (val: string) => void;
}

const SelectScoreActionContext =
  createContext<SelectScoreActionContextType | null>(null);

const useSelectScoreActionContext = () => {
  const ctx = useContext(SelectScoreActionContext);
  if (!ctx)
    throw new Error(
      'useSelectScoreActionContext must be used within SelectScoreActionProvider',
    );
  return ctx;
};

export const SelectScoreActionProvider = ({
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
    <SelectScoreActionContext.Provider value={ctx}>
      {children}
    </SelectScoreActionContext.Provider>
  );
};

const SelectScoreActionValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value } = useSelectScoreActionContext();
  const selected = ACTION_OPTIONS.find((o) => o.value === value);

  if (!selected) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select action'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>{selected.label}</p>
    </div>
  );
};

const SelectScoreActionContent = () => {
  const { value, onValueChange } = useSelectScoreActionContext();

  return (
    <Command>
      <Command.Input placeholder="Search action..." />
      <Command.Empty>
        <span className="text-muted-foreground">No action found</span>
      </Command.Empty>
      <Command.List>
        {ACTION_OPTIONS.map((opt) => (
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

export const SelectScoreActionFilterItem = () => (
  <Filter.Item value="scoreOrderType">
    <IconArrowsExchange />
    Order Type
  </Filter.Item>
);

export const SelectScoreActionFilterView = ({
  queryKey = 'scoreOrderType',
}: {
  queryKey?: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <SelectScoreActionProvider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val);
          resetFilterState();
        }}
      >
        <SelectScoreActionContent />
      </SelectScoreActionProvider>
    </Filter.View>
  );
};

export const SelectScoreActionFilterBar = () => {
  const [value, setValue] = useQueryState<string>('scoreOrderType');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="scoreOrderType">
      <Filter.BarName>
        <IconArrowsExchange />
        Order Type
      </Filter.BarName>
      <SelectScoreActionProvider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val || null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="scoreOrderType">
              <SelectScoreActionValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectScoreActionContent />
          </Combobox.Content>
        </Popover>
      </SelectScoreActionProvider>
    </Filter.BarItem>
  );
};

export const SelectScoreActionFormItem = ({
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
    <SelectScoreActionProvider
      value={value}
      onValueChange={(val) => {
        onValueChange(val);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectScoreActionValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectScoreActionContent />
        </Combobox.Content>
      </Popover>
    </SelectScoreActionProvider>
  );
};

const SelectScoreActionRoot = ({
  value,
  onValueChange,
  disabled,
}: {
  value: string;
  onValueChange?: (val: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectScoreActionProvider
      value={value}
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger disabled={disabled}>
          <SelectScoreActionValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectScoreActionContent />
        </Combobox.Content>
      </Popover>
    </SelectScoreActionProvider>
  );
};

export const SelectScoreAction = Object.assign(SelectScoreActionRoot, {
  Provider: SelectScoreActionProvider,
  Value: SelectScoreActionValue,
  Content: SelectScoreActionContent,
  FilterItem: SelectScoreActionFilterItem,
  FilterView: SelectScoreActionFilterView,
  FilterBar: SelectScoreActionFilterBar,
  FormItem: SelectScoreActionFormItem,
});
