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

import { IconUsers } from '@tabler/icons-react';
import { POS_CUSTOMERS_QUERY } from '../../graphql/queries/posCustomersQuery';
import { useQuery } from '@apollo/client';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

interface ICustomer {
  _id: string;
  code?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  firstName?: string;
  lastName?: string;
  primaryAddress?: string;
  addresses?: any[];
}

interface SelectCustomersContextType {
  value: string;
  onValueChange: (customer: string) => void;
  customers?: ICustomer[];
  loading?: boolean;
}

const SelectCustomersContext = createContext<SelectCustomersContextType | null>(
  null,
);

const useSelectCustomersContext = () => {
  const context = useContext(SelectCustomersContext);
  if (!context) {
    throw new Error(
      'useSelectCustomersContext must be used within SelectCustomersProvider',
    );
  }
  return context;
};

export const SelectCustomersProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
  searchValue,
}: {
  value: string | string[];
  onValueChange: (customer: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  searchValue?: string;
}) => {
  const { data, loading } = useQuery(POS_CUSTOMERS_QUERY, {
    variables: {
      searchValue: searchValue || '',
      perPage: 100,
      page: 1,
    },
  });

  const customers = useMemo(
    () => data?.poscCustomers || [],
    [data?.poscCustomers],
  );

  const handleValueChange = useCallback(
    (customer: string) => {
      if (!customer) return;
      onValueChange?.(customer);
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
      customers,
      loading,
    }),
    [value, handleValueChange, customers, loading, mode],
  );

  return (
    <SelectCustomersContext.Provider value={contextValue}>
      {children}
    </SelectCustomersContext.Provider>
  );
};

const SelectCustomersValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, customers } = useSelectCustomersContext();
  const selectedCustomer = customers?.find(
    (customer) => customer._id === value,
  );

  if (!selectedCustomer) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select customer'}
      </span>
    );
  }

  const displayName =
    `${selectedCustomer.firstName || ''} ${
      selectedCustomer.lastName || ''
    }`.trim() ||
    selectedCustomer.primaryEmail ||
    selectedCustomer.primaryPhone ||
    selectedCustomer.code ||
    'Unknown';

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>{displayName}</p>
    </div>
  );
};

const SelectCustomersCommandItem = ({ customer }: { customer: ICustomer }) => {
  const { onValueChange, value } = useSelectCustomersContext();
  const { _id, firstName, lastName, primaryEmail, primaryPhone, code } =
    customer || {};
  const isChecked = value.split(',').includes(_id);

  const displayName =
    `${firstName || ''} ${lastName || ''}`.trim() ||
    primaryEmail ||
    primaryPhone ||
    code ||
    'Unknown';

  return (
    <Command.Item
      value={_id}
      onSelect={() => {
        onValueChange(_id);
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{displayName}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectCustomersContent = () => {
  const { customers, loading } = useSelectCustomersContext();

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search customers" />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">Loading customers...</span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search customers" />
      <Command.Empty>
        <span className="text-muted-foreground">No customers found</span>
      </Command.Empty>
      <Command.List>
        {customers?.map((customer) => (
          <SelectCustomersCommandItem key={customer._id} customer={customer} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectCustomersFilterItem = () => {
  return (
    <Filter.Item value="customers">
      <IconUsers />
      Customers
    </Filter.Item>
  );
};

export const SelectCustomersFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  searchValue,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  searchValue?: string;
}) => {
  const [customers, setCustomers] = useQueryState<string[] | string>(
    queryKey || 'customers',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'customers'}>
      <SelectCustomersProvider
        mode={mode}
        value={customers || (mode === 'single' ? '' : [])}
        searchValue={searchValue}
        onValueChange={(value) => {
          setCustomers(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectCustomersContent />
      </SelectCustomersProvider>
    </Filter.View>
  );
};

export const SelectCustomersFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
  searchValue,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  searchValue?: string;
}) => {
  const [customers, setCustomers] = useQueryState<string[] | string>(
    'customers',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'customers'}>
      <Filter.BarName>
        <IconUsers />
        Customers
      </Filter.BarName>
      <SelectCustomersProvider
        mode={mode}
        value={customers || (mode === 'single' ? '' : [])}
        searchValue={searchValue}
        onValueChange={(value) => {
          if (value.length > 0) {
            setCustomers(value as string[] | string);
          } else {
            setCustomers(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'customers'}>
              <SelectCustomersValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectCustomersContent />
          </Combobox.Content>
        </Popover>
      </SelectCustomersProvider>
    </Filter.BarItem>
  );
};

export const SelectCustomersFormItem = ({
  onValueChange,
  className,
  placeholder,
  searchValue,
  ...props
}: Omit<React.ComponentProps<typeof SelectCustomersProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  searchValue?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCustomersProvider
      searchValue={searchValue}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectCustomersValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectCustomersContent />
        </Combobox.Content>
      </Popover>
    </SelectCustomersProvider>
  );
};

SelectCustomersFormItem.displayName = 'SelectCustomersFormItem';

const SelectCustomersRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
  searchValue,
}: {
  value: string;
  variant?: `${SelectTriggerVariantType}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  searchValue?: string;
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
    <SelectCustomersProvider
      value={value}
      searchValue={searchValue}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectCustomersValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectCustomersContent />
        </SelectContent>
      </PopoverScoped>
    </SelectCustomersProvider>
  );
};

export const SelectCustomers = Object.assign(SelectCustomersRoot, {
  Provider: SelectCustomersProvider,
  Value: SelectCustomersValue,
  Content: SelectCustomersContent,
  FilterItem: SelectCustomersFilterItem,
  FilterView: SelectCustomersFilterView,
  FilterBar: SelectCustomersFilterBar,
  FormItem: SelectCustomersFormItem,
});
