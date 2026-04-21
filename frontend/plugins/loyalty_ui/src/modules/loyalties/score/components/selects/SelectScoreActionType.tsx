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

const ACTION_OPTIONS = [
  { value: 'add', label: 'Add' },
  { value: 'subtract', label: 'Subtract' },
  { value: 'hasDescription', label: 'Has A description' },
];

interface SelectScoreActionTypeContextType {
  value: string;
  onValueChange: (val: string) => void;
}

const SelectScoreActionTypeContext =
  createContext<SelectScoreActionTypeContextType | null>(null);

const useSelectScoreActionTypeContext = () => {
  const ctx = useContext(SelectScoreActionTypeContext);
  if (!ctx)
    throw new Error(
      'useSelectScoreActionTypeContext must be used within SelectScoreActionTypeProvider',
    );
  return ctx;
};

export const SelectScoreActionTypeProvider = ({
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
    <SelectScoreActionTypeContext.Provider value={ctx}>
      {children}
    </SelectScoreActionTypeContext.Provider>
  );
};

const SelectScoreActionTypeValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value } = useSelectScoreActionTypeContext();
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

const SelectScoreActionTypeContent = () => {
  const { value, onValueChange } = useSelectScoreActionTypeContext();

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

export const SelectScoreActionTypeFilterItem = () => (
  <Filter.Item value="scoreAction">
    <IconArrowsExchange />
    Action
  </Filter.Item>
);

export const SelectScoreActionTypeFilterView = ({
  queryKey = 'scoreAction',
}: {
  queryKey?: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <SelectScoreActionTypeProvider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val);
          resetFilterState();
        }}
      >
        <SelectScoreActionTypeContent />
      </SelectScoreActionTypeProvider>
    </Filter.View>
  );
};

export const SelectScoreActionTypeFilterBar = () => {
  const [value, setValue] = useQueryState<string>('scoreAction');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="scoreAction">
      <Filter.BarName>
        <IconArrowsExchange />
        Action
      </Filter.BarName>
      <SelectScoreActionTypeProvider
        value={value || ''}
        onValueChange={(val) => {
          setValue(val || null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="scoreAction">
              <SelectScoreActionTypeValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectScoreActionTypeContent />
          </Combobox.Content>
        </Popover>
      </SelectScoreActionTypeProvider>
    </Filter.BarItem>
  );
};

export const SelectScoreActionTypeFormItem = ({
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
    <SelectScoreActionTypeProvider
      value={value}
      onValueChange={(val) => {
        onValueChange(val);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectScoreActionTypeValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectScoreActionTypeContent />
        </Combobox.Content>
      </Popover>
    </SelectScoreActionTypeProvider>
  );
};
