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
import { IconUser } from '@tabler/icons-react';
import { useQuery, gql } from '@apollo/client';

const GET_CUSTOMERS_SIMPLE = gql`
  query ScoreCustomersSimple($searchValue: String, $limit: Int) {
    customers(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
      }
    }
  }
`;

const GET_COMPANIES_SIMPLE = gql`
  query ScoreCompaniesSimpleFilter($searchValue: String, $limit: Int) {
    companies(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        primaryName
        primaryEmail
        primaryPhone
      }
    }
  }
`;

const GET_USERS_SIMPLE = gql`
  query ScoreUsersSimpleFilter($searchValue: String, $isActive: Boolean) {
    allUsers(searchValue: $searchValue, isActive: $isActive) {
      _id
      email
      details {
        fullName
        firstName
        lastName
      }
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

const useOwnerOptions = (ownerType: string, search: string) => {
  const customerQuery = useQuery(GET_CUSTOMERS_SIMPLE, {
    variables: { limit: 50, searchValue: search || undefined },
    skip: ownerType !== 'customer',
    fetchPolicy: 'cache-first',
  });

  const companyQuery = useQuery(GET_COMPANIES_SIMPLE, {
    variables: { limit: 50, searchValue: search || undefined },
    skip: ownerType !== 'company',
    fetchPolicy: 'cache-first',
  });

  const userQuery = useQuery(GET_USERS_SIMPLE, {
    variables: { searchValue: search || undefined, isActive: true },
    skip: ownerType !== 'user' || !search,
    fetchPolicy: 'cache-first',
  });

  const options = useMemo<CustomerOption[]>(() => {
    if (ownerType === 'customer') {
      return (customerQuery.data?.customers?.list || []).map(
        (c: {
          _id: string;
          firstName?: string;
          middleName?: string;
          lastName?: string;
          primaryEmail?: string;
          primaryPhone?: string;
        }) => ({ value: c._id, label: getCustomerLabel(c) }),
      );
    }
    if (ownerType === 'company') {
      return (companyQuery.data?.companies?.list || []).map(
        (c: {
          _id: string;
          primaryName?: string;
          primaryEmail?: string;
          primaryPhone?: string;
        }) => ({
          value: c._id,
          label: c.primaryName || c.primaryEmail || c.primaryPhone || 'Unnamed',
        }),
      );
    }
    if (ownerType === 'user') {
      return (userQuery.data?.allUsers || []).map(
        (u: {
          _id: string;
          email?: string;
          details?: {
            fullName?: string;
            firstName?: string;
            lastName?: string;
          };
        }) => ({
          value: u._id,
          label:
            u.details?.fullName ||
            [u.details?.firstName, u.details?.lastName]
              .filter(Boolean)
              .join(' ') ||
            u.email ||
            'Unnamed',
        }),
      );
    }
    return [];
  }, [ownerType, customerQuery.data, companyQuery.data, userQuery.data]);

  const loading =
    customerQuery.loading || companyQuery.loading || userQuery.loading;

  return { options, loading };
};

interface SelectScoreCustomerContextType {
  value: string;
  onValueChange: (val: string, label?: string) => void;
  options: CustomerOption[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  ownerType: string;
}

const SelectScoreCustomerContext =
  createContext<SelectScoreCustomerContextType | null>(null);

const useSelectScoreCustomerContext = () => {
  const ctx = useContext(SelectScoreCustomerContext);
  if (!ctx)
    throw new Error(
      'useSelectScoreCustomerContext must be used within SelectScoreCustomerProvider',
    );
  return ctx;
};

const SelectOwnerProvider = ({
  value,
  onValueChange,
  ownerType = 'customer',
  children,
}: {
  value: string;
  onValueChange: (val: string, label?: string) => void;
  ownerType?: string;
  children: React.ReactNode;
}) => {
  const [search, setSearch] = useState('');
  const { options, loading } = useOwnerOptions(ownerType, search);

  const handleChange = useCallback(
    (val: string, label?: string) => {
      if (!val) return;
      onValueChange(val, label);
    },
    [onValueChange],
  );

  const ctx = useMemo(
    () => ({
      value: value || '',
      onValueChange: handleChange,
      options,
      loading,
      search,
      setSearch,
      ownerType,
    }),
    [value, handleChange, options, loading, search, ownerType],
  );

  return (
    <SelectScoreCustomerContext.Provider value={ctx}>
      {children}
    </SelectScoreCustomerContext.Provider>
  );
};

export const SelectScoreCustomerProvider = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (val: string, label?: string) => void;
  children: React.ReactNode;
}) => (
  <SelectOwnerProvider value={value} onValueChange={onValueChange} ownerType="customer">
    {children}
  </SelectOwnerProvider>
);

const SelectScoreCustomerValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, options } = useSelectScoreCustomerContext();
  const selected = options.find((o) => o.value === value);

  if (!selected) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select customer'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>{selected.label}</p>
    </div>
  );
};

const getOwnerSearchPlaceholder = (ownerType: string) => {
  if (ownerType === 'company') return 'Search companies...';
  if (ownerType === 'user') return 'Search team members...';
  return 'Search customers...';
};

const getOwnerBarLabel = (ownerType: string) => {
  if (ownerType === 'company') return 'Company';
  if (ownerType === 'user') return 'Team Member';
  return 'Customer';
};

const SelectOwnerContent = () => {
  const {
    value,
    onValueChange,
    options,
    loading,
    search,
    setSearch,
    ownerType,
  } = useSelectScoreCustomerContext();

  const placeholder = getOwnerSearchPlaceholder(ownerType);

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={placeholder}
      />
      <Command.Empty>
        {loading ? 'Loading...' : 'No results found'}
      </Command.Empty>
      <Command.List>
        {options.map((opt) => (
          <Command.Item
            key={opt.value}
            value={opt.value}
            onSelect={() => onValueChange(opt.value, opt.label)}
          >
            <span className="font-medium">{opt.label}</span>
            <Combobox.Check checked={value === opt.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectScoreCustomerFilterItem = () => (
  <Filter.Item value="scoreOwnerId">
    <IconUser />
    Owner
  </Filter.Item>
);

export const SelectScoreCustomerFilterView = ({
  queryKey = 'scoreOwnerId',
}: {
  queryKey?: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const [ownerType] = useQueryState<string>('scoreOwnerType');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <SelectOwnerProvider
        ownerType={ownerType || 'customer'}
        value={value || ''}
        onValueChange={(val) => {
          setValue(val);
          resetFilterState();
        }}
      >
        <SelectOwnerContent />
      </SelectOwnerProvider>
    </Filter.View>
  );
};

const SelectOwnerBarButton = ({
  filterKey,
  barLabel,
}: {
  filterKey: string;
  barLabel: string;
}) => {
  const { value, options } = useSelectScoreCustomerContext();
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Filter.BarButton filterKey={filterKey}>
      {value && selectedOption ? (
        <span className="font-medium text-sm">{selectedOption.label}</span>
      ) : (
        <span className="text-accent-foreground/80">Select {barLabel}</span>
      )}
    </Filter.BarButton>
  );
};

export const SelectScoreCustomerFilterBar = () => {
  const [value, setValue] = useQueryState<string>('scoreOwnerId');
  const [ownerType] = useQueryState<string>('scoreOwnerType');
  const [open, setOpen] = useState(false);

  const barLabel = getOwnerBarLabel(ownerType || 'customer');

  return (
    <Filter.BarItem queryKey="scoreOwnerId">
      <Filter.BarName>
        <IconUser />
        {barLabel}
      </Filter.BarName>
      <SelectOwnerProvider
        ownerType={ownerType || 'customer'}
        value={value || ''}
        onValueChange={(val) => {
          setValue(val || null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <SelectOwnerBarButton
              filterKey="scoreOwnerId"
              barLabel={barLabel}
            />
          </Popover.Trigger>
          <Combobox.Content>
            <SelectOwnerContent />
          </Combobox.Content>
        </Popover>
      </SelectOwnerProvider>
    </Filter.BarItem>
  );
};

export const SelectScoreCustomerFormItem = ({
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (val: string, label?: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectOwnerProvider
      value={value}
      ownerType="customer"
      onValueChange={(val, label) => {
        onValueChange(val, label);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectScoreCustomerValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectOwnerContent />
        </Combobox.Content>
      </Popover>
    </SelectOwnerProvider>
  );
};

const SelectScoreCustomerRoot = ({
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange?: (val: string, label?: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectOwnerProvider
      value={value}
      ownerType="customer"
      onValueChange={(val, label) => {
        onValueChange?.(val, label);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className={cn('shadow-xs', className)}>
          <SelectScoreCustomerValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectOwnerContent />
        </Combobox.Content>
      </Popover>
    </SelectOwnerProvider>
  );
};

export const SelectScoreCustomer = Object.assign(SelectScoreCustomerRoot, {
  Provider: SelectScoreCustomerProvider,
  Value: SelectScoreCustomerValue,
  Content: SelectOwnerContent,
  FilterItem: SelectScoreCustomerFilterItem,
  FilterView: SelectScoreCustomerFilterView,
  FilterBar: SelectScoreCustomerFilterBar,
  FormItem: SelectScoreCustomerFormItem,
});
