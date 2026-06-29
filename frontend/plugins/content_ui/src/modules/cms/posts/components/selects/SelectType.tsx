import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  Combobox,
  Command,
  Filter,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';

import { IconLabel } from '@tabler/icons-react';
import { useCustomTypes } from '../../../custom-types/hooks/useCustomTypes';
import {
  SelectTriggerVariantType,
  SelectItemValueBase,
  SelectCommandList,
  SelectFormPopover,
  SelectBarPopover,
  SelectRootPopover,
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
  error?: unknown;
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
  const { customTypes, loading, error } = useCustomTypes({ clientPortalId });

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
      error,
    }),
    [value, handleValueChange, types, loading, error],
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
  return (
    <SelectItemValueBase
      label={selectedType?.label}
      placeholder={placeholder || 'Select type'}
      className={className}
    />
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
  const { types, loading, error } = useSelectTypeContext();
  return (
    <SelectCommandList
      loading={loading}
      error={error}
      placeholder="Search type"
      loadingText="Loading types..."
      emptyText="No types found"
      errorText="Failed to load types"
    >
      {types.map((type) => (
        <SelectTypeCommandItem key={type.value} type={type} />
      ))}
    </SelectCommandList>
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
          setType(value || null);
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
          setType(value || null);
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <SelectBarPopover
          open={open}
          onOpenChange={setOpen}
          filterKey="type"
          content={<SelectTypeContent />}
        >
          <SelectTypeValue />
        </SelectBarPopover>
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
      <SelectFormPopover
        open={open}
        onOpenChange={setOpen}
        className={className}
        content={<SelectTypeContent />}
      >
        <SelectTypeValue placeholder={placeholder} />
      </SelectFormPopover>
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
      <SelectRootPopover
        open={open}
        onOpenChange={setOpen}
        scope={scope}
        variant={variant}
        disabled={disabled}
        content={<SelectTypeContent />}
      >
        <SelectTypeValue />
      </SelectRootPopover>
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
