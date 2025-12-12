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

import { IconToggleLeft } from '@tabler/icons-react';
import { ON_LAST_DATA } from '../../constants/onLastData';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

interface IOnLast {
  value: string;
  label: string;
}

interface SelectOnLastContextType {
  value: string | string[];
  onValueChange: (onLast: string) => void;
  onLasts?: IOnLast[];
  mode: 'single' | 'multiple';
}

const SelectOnLastContext = createContext<SelectOnLastContextType | null>(null);

const useSelectOnLastContext = () => {
  const context = useContext(SelectOnLastContext);
  if (!context) {
    throw new Error(
      'useSelectOnLastContext must be used within SelectOnLastProvider',
    );
  }
  return context;
};

export const SelectOnLastProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (onLast: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const onLasts = ON_LAST_DATA;

  const handleValueChange = useCallback(
    (onLast: string) => {
      if (mode === 'multiple') {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(onLast)
          ? currentValues.filter((v) => v !== onLast)
          : [...currentValues, onLast];
        onValueChange?.(newValues.join(','));
      } else {
        if (!onLast) return;
        onValueChange?.(onLast);
      }
    },
    [onValueChange, mode, value],
  );

  const contextValue = useMemo(
    () => ({
      value: mode === 'single' ? (value as string) || '' : value,
      onValueChange: handleValueChange,
      onLasts,
      mode,
    }),
    [value, handleValueChange, onLasts, mode],
  );

  return (
    <SelectOnLastContext.Provider value={contextValue}>
      {children}
    </SelectOnLastContext.Provider>
  );
};

const SelectOnLastValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, onLasts, mode } = useSelectOnLastContext();

  if (mode === 'multiple') {
    const valueArray = Array.isArray(value) ? value : [];
    const selectedOnLasts = onLasts?.filter((type) =>
      valueArray.includes(type.value),
    );

    if (!selectedOnLasts || selectedOnLasts.length === 0) {
      return (
        <span className="text-accent-foreground/80">
          {placeholder || 'Select on last'}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <p className={cn('font-medium text-sm', className)}>
          {selectedOnLasts.map((s) => s.label).join(', ')}
        </p>
      </div>
    );
  }

  const selectedOnLast = onLasts?.find((type) => type.value === value);

  if (!selectedOnLast) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select on last'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedOnLast.label}
      </p>
    </div>
  );
};

const SelectOnLastCommandItem = ({ onLast }: { onLast: IOnLast }) => {
  const { onValueChange, value, mode } = useSelectOnLastContext();
  const { value: onLastValue, label } = onLast || {};

  const isChecked =
    mode === 'multiple'
      ? Array.isArray(value) && value.includes(onLastValue)
      : value === onLastValue;

  return (
    <Command.Item
      value={onLastValue}
      onSelect={() => {
        onValueChange(onLastValue);
      }}
    >
      <span className="font-medium">{label}</span>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectOnLastContent = () => {
  const { onLasts } = useSelectOnLastContext();

  return (
    <Command>
      <Command.Input placeholder="Search on last" />
      <Command.Empty>
        <span className="text-muted-foreground">No on last options found</span>
      </Command.Empty>
      <Command.List>
        {onLasts?.map((onLast) => (
          <SelectOnLastCommandItem key={onLast.value} onLast={onLast} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectOnLastFilterItem = () => {
  return (
    <Filter.Item value="isLast">
      <IconToggleLeft />
      On Last
    </Filter.Item>
  );
};

export const SelectOnLastFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [onLast, setOnLast] = useQueryState<string[] | string>(
    queryKey || 'isLast',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'isLast'}>
      <SelectOnLastProvider
        mode={mode}
        value={onLast || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          const parsedValue =
            mode === 'multiple' ? value.split(',').filter(Boolean) : value;
          setOnLast(parsedValue as string[] | string);
          resetFilterState();
          onValueChange?.(parsedValue);
        }}
      >
        <SelectOnLastContent />
      </SelectOnLastProvider>
    </Filter.View>
  );
};

export const SelectOnLastFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [onLast, setOnLast] = useQueryState<string[] | string>('isLast');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'isLast'}>
      {!iconOnly && (
        <Filter.BarName>
          <IconToggleLeft />
          On Last
        </Filter.BarName>
      )}
      <SelectOnLastProvider
        mode={mode}
        value={onLast || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          const parsedValue =
            mode === 'multiple' ? value.split(',').filter(Boolean) : value;
          if (
            (Array.isArray(parsedValue) && parsedValue.length > 0) ||
            (typeof parsedValue === 'string' && parsedValue.length > 0)
          ) {
            setOnLast(parsedValue as string[] | string);
          } else {
            setOnLast(null);
          }
          setOpen(false);
          onValueChange?.(parsedValue);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'isLast'}>
              {iconOnly ? <IconToggleLeft /> : <SelectOnLastValue />}
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectOnLastContent />
          </Combobox.Content>
        </Popover>
      </SelectOnLastProvider>
    </Filter.BarItem>
  );
};

export const SelectOnLastFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectOnLastProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectOnLastProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectOnLastValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectOnLastContent />
        </Combobox.Content>
      </Popover>
    </SelectOnLastProvider>
  );
};

SelectOnLastFormItem.displayName = 'SelectOnLastFormItem';

const SelectOnLastRoot = ({
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
    <SelectOnLastProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectOnLastValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectOnLastContent />
        </SelectContent>
      </PopoverScoped>
    </SelectOnLastProvider>
  );
};

export const SelectOnLast = Object.assign(SelectOnLastRoot, {
  Provider: SelectOnLastProvider,
  Value: SelectOnLastValue,
  Content: SelectOnLastContent,
  FilterItem: SelectOnLastFilterItem,
  FilterView: SelectOnLastFilterView,
  FilterBar: SelectOnLastFilterBar,
  FormItem: SelectOnLastFormItem,
});
