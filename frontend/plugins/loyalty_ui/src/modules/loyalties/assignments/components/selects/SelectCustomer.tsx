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
import { IconUser } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { gql } from '@apollo/client';

const GET_CUSTOMERS_SIMPLE = gql`
  query CustomersSimple($searchValue: String, $limit: Int) {
    customers(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
      }
      totalCount
    }
  }
`;

interface CustomerOption {
  value: string;
  label: string;
}

const getCustomerLabel = (c: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
}) => {
  const name = [c.firstName, c.middleName, c.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return name || c.primaryEmail || c.primaryPhone || 'Unnamed';
};

const useCustomerOptions = (searchValue?: string) => {
  const { data, loading } = useQuery(GET_CUSTOMERS_SIMPLE, {
    variables: { limit: 50, searchValue },
  });

  const options = useMemo<CustomerOption[]>(
    () =>
      (data?.customers?.list || []).map(
        (c: {
          _id: string;
          firstName?: string;
          middleName?: string;
          lastName?: string;
          primaryEmail?: string;
          primaryPhone?: string;
        }) => ({
          value: c._id,
          label: getCustomerLabel(c),
        }),
      ),
    [data?.customers?.list],
  );

  return { options, loading };
};

export const SelectCustomerFilterItem = () => (
  <Filter.Item value="assignmentOwnerId">
    <IconUser />
    Customer
  </Filter.Item>
);

export const SelectCustomerFilterView = ({
  queryKey = 'assignmentOwnerId',
}: {
  queryKey?: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();
  const [search, setSearch] = useState('');
  const { options, loading } = useCustomerOptions(search);

  return (
    <Filter.View filterKey={queryKey}>
      <Command shouldFilter={false}>
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Search customers..."
        />
        <Command.Empty>{loading ? 'Loading...' : 'No customers found'}</Command.Empty>
        <Command.List>
          {options.map((opt) => (
            <Command.Item
              key={opt.value}
              value={opt.value}
              onSelect={() => {
                setValue(opt.value);
                resetFilterState();
              }}
            >
              {opt.label}
              <Combobox.Check checked={value === opt.value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

export const SelectCustomerFilterBar = () => {
  const [value, setValue] = useQueryState<string>('assignmentOwnerId');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { options } = useCustomerOptions(search);
  const selected = options.find((o) => o.value === value);

  return (
    <Filter.BarItem queryKey="assignmentOwnerId">
      <Filter.BarName>
        <IconUser />
        Customer
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="assignmentOwnerId">
            <span>{selected?.label || 'Customer'}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search customers..."
            />
            <Command.List>
              {options.map((opt) => (
                <Command.Item
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    setValue(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                  <Combobox.Check checked={value === opt.value} />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const SelectCustomerFormItem = ({
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
  const [search, setSearch] = useState('');
  const { options, loading } = useCustomerOptions(search);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger
          className={cn('w-full shadow-xs', className)}
          disabled={loading}
        >
          <span className={selected ? '' : 'text-muted-foreground'}>
            {selected?.label || placeholder || 'Choose customer'}
          </span>
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search customers..."
          />
          <Command.Empty>{loading ? 'Loading...' : 'No customers found'}</Command.Empty>
          <Command.List>
            {options.map((opt) => (
              <Command.Item
                key={opt.value}
                value={opt.value}
                onSelect={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                <Combobox.Check checked={value === opt.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
