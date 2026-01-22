import {
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';

import { CustomersInline } from './CustomersInline';
import { ICustomer } from '../types';
import { IconUser } from '@tabler/icons-react';
import { SelectCustomerContext } from '../contexts/SelectCustomerContext';
import { useCustomers } from '../hooks';
import { useDebounce } from 'use-debounce';
import { useSelectCustomerContext } from '../hooks/useSelectCustomerContext';
import { useState } from 'react';

interface SelectCustomerProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}

const SelectCustomerProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
}: SelectCustomerProviderProps) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const customerIds = !value ? [] : Array.isArray(value) ? value : [value];
  const onSelect = (customer: ICustomer) => {
    if (!customer) return;
    if (mode === 'single') {
      setCustomers([customer]);
      onValueChange?.(customer._id);
      return;
    }
    const arrayValue = Array.isArray(value) ? value : [];
    const isCustomerSelected = arrayValue.includes(customer._id);
    const newSelectedCustomerIds = isCustomerSelected
      ? arrayValue.filter((id) => id !== customer._id)
      : [...arrayValue, customer._id];

    setCustomers((prevCustomers) => {
      const customerMap = new Map(prevCustomers.map((c) => [c._id, c]));
      customerMap.set(customer._id, customer);
      return newSelectedCustomerIds
        .map((id) => customerMap.get(id))
        .filter((c): c is ICustomer => c !== undefined);
    });
    onValueChange?.(newSelectedCustomerIds);
  };
  return (
    <SelectCustomerContext.Provider
      value={{
        customerIds,
        onSelect,
        customers,
        setCustomers,
        loading: false,
        error: null,
      }}
    >
      {children}
    </SelectCustomerContext.Provider>
  );
};

const SelectCustomerContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { customerIds, customers } = useSelectCustomerContext();
  const {
    customers: customersData,
    loading,
    handleFetchMore,
    totalCount,
    error,
  } = useCustomers({
    variables: {
      searchValue: debouncedSearch,
    },
  });
  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        {customers?.length > 0 && (
          <>
            {customers.map((customer) => (
              <SelectCustomerCommandItem
                key={customer._id}
                customer={customer}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        <Combobox.Empty loading={loading} error={error} />
        {!loading &&
          customersData
            ?.filter(
              (customer) =>
                !customerIds.find((customerId) => customerId === customer._id),
            )
            .map((customer) => (
              <SelectCustomerCommandItem
                key={customer._id}
                customer={customer}
              />
            ))}

        {!loading && (
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={customersData.length}
            totalCount={totalCount}
          />
        )}
      </Command.List>
    </Command>
  );
};

const SelectCustomerCommandItem = ({ customer }: { customer: ICustomer }) => {
  const { onSelect, customerIds } = useSelectCustomerContext();
  return (
    <Command.Item
      value={customer._id}
      onSelect={() => {
        onSelect(customer);
      }}
    >
      <CustomersInline customers={[customer]} placeholder="Unnamed customer" />
      <Combobox.Check checked={customerIds.includes(customer._id)} />
    </Command.Item>
  );
};

const SelectCustomerInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectCustomerProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCustomerProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        if (props.mode === 'single') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectCustomer.Value />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectCustomer.Content />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectCustomerProvider>
  );
};

const SelectCustomerRoot = ({
  onValueChange,
  className,
  mode = 'single',
  ...props
}: Omit<React.ComponentProps<typeof SelectCustomerProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCustomerProvider
      onValueChange={(value) => {
        if (mode === 'single') {
          setOpen(false);
        }
        onValueChange?.(value);
      }}
      mode={mode}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          className={cn('w-full inline-flex', className)}
          variant="outline"
        >
          <SelectCustomer.Value />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectCustomer.Content />
        </Combobox.Content>
      </Popover>
    </SelectCustomerProvider>
  );
};
const SelectCustomerValue = () => {
  const { customerIds, customers, setCustomers } = useSelectCustomerContext();

  return (
    <CustomersInline
      customerIds={customerIds}
      customers={customers}
      updateCustomers={setCustomers}
    />
  );
};

const SelectCustomerFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectCustomerProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCustomerProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        if (props.mode === 'single') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectCustomer.Value />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectCustomer.Content />
        </Combobox.Content>
      </Popover>
    </SelectCustomerProvider>
  );
};

export const SelectCustomerFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconUser />
      {label}
    </Filter.Item>
  );
};

export const SelectCustomerFilterView = ({
  mode = 'multiple',
  filterKey,
}: {
  mode?: 'single' | 'multiple';
  filterKey: string;
}) => {
  const [query, setQuery] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectCustomerProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value as string[]);
          resetFilterState();
        }}
      >
        <SelectCustomer.Content />
      </SelectCustomerProvider>
    </Filter.View>
  );
};

export const SelectCustomerFilterBar = ({
  mode = 'multiple',
  filterKey,
  label,
}: {
  mode?: 'single' | 'multiple';
  filterKey: string;
  label: string;
}) => {
  const [query, setQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);

  if (!query || query.length === 0) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        <IconUser />
        {label}
      </Filter.BarName>
      <SelectCustomerProvider
        mode={mode}
        value={query}
        onValueChange={(value) => {
          const values = value as string[];
          if (values.length > 0) {
            setQuery(values);
          } else {
            setQuery(null);
          }
          if (mode === 'single') {
            setOpen(false);
          }
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={filterKey}>
              <SelectCustomerValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectCustomer.Content />
          </Combobox.Content>
        </Popover>
      </SelectCustomerProvider>
    </Filter.BarItem>
  );
};

export const SelectCustomer = Object.assign(SelectCustomerRoot, {
  Provider: SelectCustomerProvider,
  Content: SelectCustomerContent,
  Item: SelectCustomerCommandItem,
  InlineCell: SelectCustomerInlineCell,
  Value: SelectCustomerValue,
  FormItem: SelectCustomerFormItem,
  FilterItem: SelectCustomerFilterItem,
  FilterView: SelectCustomerFilterView,
  FilterBar: SelectCustomerFilterBar,
});
