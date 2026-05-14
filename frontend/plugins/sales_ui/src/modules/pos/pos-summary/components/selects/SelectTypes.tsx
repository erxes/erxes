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

import { IconCategory } from '@tabler/icons-react';
import { TYPES_DATA } from '../../constants/typesData';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

interface IType {
  value: string;
  label: string;
}

interface SelectTypeContextType {
  value: string;
  onValueChange: (type: string) => void;
  types?: IType[];
}

const SelectTypeContext = createContext<SelectTypeContextType | null>(null);

const useSelectTypeContext = () => {
  const context = useContext(SelectTypeContext);
  if (!context) {
    throw new Error(
      'useSelectTypeContext must be used within SelectTypeProvider',
    );
  }
  return context;
};

export const SelectTypeProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (type: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const types = TYPES_DATA;

  const handleValueChange = useCallback(
    (type: string) => {
      if (!type) return;
      onValueChange?.(type);
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
      types,
    }),
    [value, handleValueChange, types, mode],
  );

  return (
    <SelectTypeContext.Provider value={contextValue}>
      {children}
    </SelectTypeContext.Provider>
  );
};

const SelectTypeValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, types } = useSelectTypeContext();
  const selectedType = types?.find((type) => type.value === value);

  if (!selectedType) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select type'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedType.label}
      </p>
    </div>
  );
};

const SelectTypeCommandItem = ({ type }: { type: IType }) => {
  const { onValueChange, value } = useSelectTypeContext();
  const { value: typeValue, label } = type || {};

  return (
    <Command.Item
      value={typeValue}
      onSelect={() => {
        onValueChange(typeValue);
      }}
    >
      <span className="font-medium">{label}</span>
      <Combobox.Check checked={value === typeValue} />
    </Command.Item>
  );
};

const SelectTypeContent = () => {
  const { types } = useSelectTypeContext();

  return (
    <Command>
      <Command.Input placeholder="Search type" />
      <Command.Empty>
        <span className="text-muted-foreground">No types found</span>
      </Command.Empty>
      <Command.List>
        {types?.map((type) => (
          <SelectTypeCommandItem key={type.value} type={type} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectTypeFilterItem = () => {
  return (
    <Filter.Item value="types">
      <IconCategory />
      Type
    </Filter.Item>
  );
};

export const SelectTypeFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [type, setType] = useQueryState<string[] | string>(queryKey || 'types');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'types'}>
      <SelectTypeProvider
        mode={mode}
        value={type || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setType(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectTypeContent />
      </SelectTypeProvider>
    </Filter.View>
  );
};

export const SelectTypeFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [type, setType] = useQueryState<string[] | string>('types');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'types'}>
      <Filter.BarName>
        <IconCategory />
        Type
      </Filter.BarName>
      <SelectTypeProvider
        mode={mode}
        value={type || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setType(value as string[] | string);
          } else {
            setType(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'types'}>
              <SelectTypeValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectTypeContent />
          </Combobox.Content>
        </Popover>
      </SelectTypeProvider>
    </Filter.BarItem>
  );
};

export const SelectTypeFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectTypeProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectTypeProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectTypeValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectTypeContent />
        </Combobox.Content>
      </Popover>
    </SelectTypeProvider>
  );
};

SelectTypeFormItem.displayName = 'SelectTypeFormItem';

const SelectTypeRoot = ({
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
    <SelectTypeProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectTypeValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectTypeContent />
        </SelectContent>
      </PopoverScoped>
    </SelectTypeProvider>
  );
};

export const SelectTypes = Object.assign(SelectTypeRoot, {
  Provider: SelectTypeProvider,
  Value: SelectTypeValue,
  Content: SelectTypeContent,
  FilterItem: SelectTypeFilterItem,
  FilterView: SelectTypeFilterView,
  FilterBar: SelectTypeFilterBar,
  FormItem: SelectTypeFormItem,
});
