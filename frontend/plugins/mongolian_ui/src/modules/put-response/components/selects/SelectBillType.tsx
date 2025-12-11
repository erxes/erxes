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

import { IconSettings } from '@tabler/icons-react';
import { BILL_TYPE_DATA } from '../../constants/billTypeData';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariant,
} from './SelectShared';

interface IBillType {
  value: string;
  label: string;
}

interface SelectBillTypeContextType {
  value: string;
  onValueChange: (billType: string) => void;
  billTypes?: IBillType[];
}

const SelectBillTypeContext = createContext<SelectBillTypeContextType | null>(
  null,
);

const useSelectBillTypeContext = () => {
  const context = useContext(SelectBillTypeContext);
  if (!context) {
    throw new Error(
      'useSelectBillTypeContext must be used within SelectBillTypeProvider',
    );
  }
  return context;
};

export const SelectBillTypeProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (billType: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const billTypes = BILL_TYPE_DATA;

  const handleValueChange = useCallback(
    (billType: string) => {
      if (!billType) return;
      onValueChange?.(billType);
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
      billTypes,
    }),
    [value, handleValueChange, billTypes, mode],
  );

  return (
    <SelectBillTypeContext.Provider value={contextValue}>
      {children}
    </SelectBillTypeContext.Provider>
  );
};

const SelectBillTypeValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, billTypes } = useSelectBillTypeContext();
  const selectedBillType = billTypes?.find((type) => type.value === value);

  if (!selectedBillType) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select bill type'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedBillType.label}
      </p>
    </div>
  );
};

const SelectBillTypeCommandItem = ({ billType }: { billType: IBillType }) => {
  const { onValueChange, value } = useSelectBillTypeContext();
  const { value: billTypeValue, label } = billType || {};

  return (
    <Command.Item
      value={billTypeValue}
      onSelect={() => {
        onValueChange(billTypeValue);
      }}
    >
      <span className="font-medium">{label}</span>
      <Combobox.Check checked={value === billTypeValue} />
    </Command.Item>
  );
};

const SelectBillTypeContent = () => {
  const { billTypes } = useSelectBillTypeContext();

  return (
    <Command>
      <Command.Input placeholder="Search bill type" />
      <Command.Empty>
        <span className="text-muted-foreground">No bill types found</span>
      </Command.Empty>
      <Command.List>
        {billTypes?.map((billType) => (
          <SelectBillTypeCommandItem key={billType.value} billType={billType} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectBillTypeFilterItem = () => {
  return (
    <Filter.Item value="billType">
      <IconSettings />
      Bill Type
    </Filter.Item>
  );
};

export const SelectBillTypeFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [billType, setBillType] = useQueryState<string[] | string>(
    queryKey || 'billType',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'billType'}>
      <SelectBillTypeProvider
        mode={mode}
        value={billType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setBillType(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectBillTypeContent />
      </SelectBillTypeProvider>
    </Filter.View>
  );
};

export const SelectBillTypeFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [billType, setBillType] = useQueryState<string[] | string>('billType');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'billType'}>
      <Filter.BarName>
        <IconSettings />
        Bill Type
      </Filter.BarName>
      <SelectBillTypeProvider
        mode={mode}
        value={billType || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setBillType(value as string[] | string);
          } else {
            setBillType(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'billType'}>
              <SelectBillTypeValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectBillTypeContent />
          </Combobox.Content>
        </Popover>
      </SelectBillTypeProvider>
    </Filter.BarItem>
  );
};

export const SelectBillTypeFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectBillTypeProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBillTypeProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectBillTypeValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectBillTypeContent />
        </Combobox.Content>
      </Popover>
    </SelectBillTypeProvider>
  );
};

SelectBillTypeFormItem.displayName = 'SelectBillTypeFormItem';

const SelectBillTypeRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant?: `${SelectTriggerVariant}`;
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
    <SelectBillTypeProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectBillTypeValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectBillTypeContent />
        </SelectContent>
      </PopoverScoped>
    </SelectBillTypeProvider>
  );
};

export const SelectBillType = Object.assign(SelectBillTypeRoot, {
  Provider: SelectBillTypeProvider,
  Value: SelectBillTypeValue,
  Content: SelectBillTypeContent,
  FilterItem: SelectBillTypeFilterItem,
  FilterView: SelectBillTypeFilterView,
  FilterBar: SelectBillTypeFilterBar,
  FormItem: SelectBillTypeFormItem,
});
