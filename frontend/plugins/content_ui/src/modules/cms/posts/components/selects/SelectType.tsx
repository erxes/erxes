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

import { IconLabel } from '@tabler/icons-react';
import { useCustomTypes } from '../../../custom-types/hooks/useCustomTypes';
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
  types: IType[];
  loading: boolean;
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
  clientPortalId,
}: {
  value: string;
  onValueChange: (type: string) => void;
  children: React.ReactNode;
  clientPortalId?: string;
}) => {
  const { customTypes, loading } = useCustomTypes({ clientPortalId });

  const types = useMemo<IType[]>(
    () => [
      { value: 'post', label: 'Post' },
      ...customTypes.map((t) => ({
        value: t.code,
        label: t.pluralLabel || t.label,
      })),
    ],
    [customTypes],
  );

  const handleValueChange = useCallback(
    (type: string) => {
      if (!type) return;
      onValueChange?.(type);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value: value || '',
      onValueChange: handleValueChange,
      types,
      loading,
    }),
    [value, handleValueChange, types, loading],
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
  const selectedType = types.find((t) => t.value === value);

  if (!selectedType) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select type'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>{selectedType.label}</p>
    </div>
  );
};

const SelectTypeCommandItem = ({ type }: { type: IType }) => {
  const { onValueChange, value } = useSelectTypeContext();
  const isChecked = value === type.value;

  return (
    <Command.Item
      value={type.value}
      onSelect={() => {
        onValueChange(type.value);
      }}
    >
      <span className="font-medium">{type.label}</span>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectTypeContent = () => {
  const { types, loading } = useSelectTypeContext();

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search type" />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">Loading types...</span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search type" />
      <Command.Empty>
        <span className="text-muted-foreground">No types found</span>
      </Command.Empty>
      <Command.List>
        {types.map((type) => (
          <SelectTypeCommandItem key={type.value} type={type} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectTypeFilterItem = () => {
  return (
    <Filter.Item value="type">
      <IconLabel />
      Type
    </Filter.Item>
  );
};

export const SelectTypeFilterView = ({
  onValueChange,
  queryKey,
  clientPortalId,
}: {
  onValueChange?: (value: string) => void;
  queryKey?: string;
  clientPortalId?: string;
}) => {
  const [type, setType] = useQueryState<string>(queryKey || 'type');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'type'}>
      <SelectTypeProvider
        value={type || ''}
        clientPortalId={clientPortalId}
        onValueChange={(value) => {
          setType(value);
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
  onValueChange,
  clientPortalId,
}: {
  onValueChange?: (value: string) => void;
  clientPortalId?: string;
}) => {
  const [type, setType] = useQueryState<string>('type');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'type'}>
      <Filter.BarName>
        <IconLabel />
        Type
      </Filter.BarName>
      <SelectTypeProvider
        value={type || ''}
        clientPortalId={clientPortalId}
        onValueChange={(value) => {
          if (value) {
            setType(value);
          } else {
            setType(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'type'}>
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
  clientPortalId,
  ...props
}: Omit<React.ComponentProps<typeof SelectTypeProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  clientPortalId?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectTypeProvider
      clientPortalId={clientPortalId}
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
  clientPortalId,
}: {
  value: string;
  variant?: `${SelectTriggerVariantType}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  clientPortalId?: string;
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
    <SelectTypeProvider
      value={value}
      clientPortalId={clientPortalId}
      onValueChange={handleValueChange}
    >
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

export const SelectType = Object.assign(SelectTypeRoot, {
  Provider: SelectTypeProvider,
  Value: SelectTypeValue,
  Content: SelectTypeContent,
  FilterItem: SelectTypeFilterItem,
  FilterView: SelectTypeFilterView,
  FilterBar: SelectTypeFilterBar,
  FormItem: SelectTypeFormItem,
});
