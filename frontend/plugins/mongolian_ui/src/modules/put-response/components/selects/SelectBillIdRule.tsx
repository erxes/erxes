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

import { IconFilter } from '@tabler/icons-react';
import { BILL_ID_RULE_DATA } from '../../constants/billIdRuleData';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariant,
} from './SelectShared';

interface IBillIdRule {
  value: string;
  label: string;
}

interface SelectBillIdRuleContextType {
  value: string;
  onValueChange: (billIdRule: string) => void;
  billIdRules?: IBillIdRule[];
}

const SelectBillIdRuleContext =
  createContext<SelectBillIdRuleContextType | null>(null);

const useSelectBillIdRuleContext = () => {
  const context = useContext(SelectBillIdRuleContext);
  if (!context) {
    throw new Error(
      'useSelectBillIdRuleContext must be used within SelectBillIdRuleProvider',
    );
  }
  return context;
};

export const SelectBillIdRuleProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (billIdRule: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const billIdRules = BILL_ID_RULE_DATA;

  const handleValueChange = useCallback(
    (billIdRule: string) => {
      if (!billIdRule) return;
      onValueChange?.(billIdRule);
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
      billIdRules,
    }),
    [value, handleValueChange, billIdRules, mode],
  );

  return (
    <SelectBillIdRuleContext.Provider value={contextValue}>
      {children}
    </SelectBillIdRuleContext.Provider>
  );
};

const SelectBillIdRuleValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, billIdRules } = useSelectBillIdRuleContext();
  const selectedBillIdRule = billIdRules?.find((type) => type.value === value);

  if (!selectedBillIdRule) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select bill ID rule'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedBillIdRule.label}
      </p>
    </div>
  );
};

const SelectBillIdRuleCommandItem = ({
  billIdRule,
}: {
  billIdRule: IBillIdRule;
}) => {
  const { onValueChange, value } = useSelectBillIdRuleContext();
  const { value: billIdRuleValue, label } = billIdRule || {};

  return (
    <Command.Item
      value={billIdRuleValue}
      onSelect={() => {
        onValueChange(billIdRuleValue);
      }}
    >
      <span className="font-medium">{label}</span>
      <Combobox.Check checked={value === billIdRuleValue} />
    </Command.Item>
  );
};

const SelectBillIdRuleContent = () => {
  const { billIdRules } = useSelectBillIdRuleContext();

  return (
    <Command>
      <Command.Input placeholder="Search bill ID rule" />
      <Command.Empty>
        <span className="text-muted-foreground">No bill ID rules found</span>
      </Command.Empty>
      <Command.List>
        {billIdRules?.map((billIdRule) => (
          <SelectBillIdRuleCommandItem
            key={billIdRule.value}
            billIdRule={billIdRule}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectBillIdRuleFilterItem = () => {
  return (
    <Filter.Item value="billIdRule">
      <IconFilter />
      Bill ID Rule
    </Filter.Item>
  );
};

export const SelectBillIdRuleFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [billIdRule, setBillIdRule] = useQueryState<string[] | string>(
    queryKey || 'billIdRule',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'billIdRule'}>
      <SelectBillIdRuleProvider
        mode={mode}
        value={billIdRule || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setBillIdRule(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectBillIdRuleContent />
      </SelectBillIdRuleProvider>
    </Filter.View>
  );
};

export const SelectBillIdRuleFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [billIdRule, setBillIdRule] = useQueryState<string[] | string>(
    'billIdRule',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'billIdRule'}>
      <Filter.BarName>
        <IconFilter />
        Bill ID Rule
      </Filter.BarName>
      <SelectBillIdRuleProvider
        mode={mode}
        value={billIdRule || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setBillIdRule(value as string[] | string);
          } else {
            setBillIdRule(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'billIdRule'}>
              <SelectBillIdRuleValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectBillIdRuleContent />
          </Combobox.Content>
        </Popover>
      </SelectBillIdRuleProvider>
    </Filter.BarItem>
  );
};

export const SelectBillIdRuleFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectBillIdRuleProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBillIdRuleProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectBillIdRuleValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectBillIdRuleContent />
        </Combobox.Content>
      </Popover>
    </SelectBillIdRuleProvider>
  );
};

SelectBillIdRuleFormItem.displayName = 'SelectBillIdRuleFormItem';

const SelectBillIdRuleRoot = ({
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
    <SelectBillIdRuleProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectBillIdRuleValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectBillIdRuleContent />
        </SelectContent>
      </PopoverScoped>
    </SelectBillIdRuleProvider>
  );
};

export const SelectBillIdRule = Object.assign(SelectBillIdRuleRoot, {
  Provider: SelectBillIdRuleProvider,
  Value: SelectBillIdRuleValue,
  Content: SelectBillIdRuleContent,
  FilterItem: SelectBillIdRuleFilterItem,
  FilterView: SelectBillIdRuleFilterView,
  FilterBar: SelectBillIdRuleFilterBar,
  FormItem: SelectBillIdRuleFormItem,
});
