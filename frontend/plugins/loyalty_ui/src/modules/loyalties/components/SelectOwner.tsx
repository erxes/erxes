import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  query OwnerCustomersSimple($searchValue: String, $limit: Int) {
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
  query OwnerCompaniesSimple($searchValue: String, $limit: Int) {
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
  query OwnerUsersSimple($searchValue: String, $isActive: Boolean) {
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

interface OwnerOption {
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

  const options = useMemo<OwnerOption[]>(() => {
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

interface SelectOwnerContextType {
  value: string;
  onValueChange: (val: string, label?: string) => void;
  options: OwnerOption[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  ownerType: string;
}

const SelectOwnerContext = createContext<SelectOwnerContextType | null>(null);

const useSelectOwnerContext = () => {
  const ctx = useContext(SelectOwnerContext);
  if (!ctx)
    throw new Error(
      'useSelectOwnerContext must be used within SelectOwnerProvider',
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
    <SelectOwnerContext.Provider value={ctx}>
      {children}
    </SelectOwnerContext.Provider>
  );
};

const SelectOwnerValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, options } = useSelectOwnerContext();
  const selected = options.find((o) => o.value === value);

  if (!selected) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select owner'}
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
  } = useSelectOwnerContext();

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

const SelectOwnerFilterItem = ({ queryKey }: { queryKey: string }) => (
  <Filter.Item value={queryKey}>
    <IconUser />
    Owner
  </Filter.Item>
);

const SelectOwnerFilterView = ({
  queryKey,
  ownerTypeKey,
}: {
  queryKey: string;
  ownerTypeKey: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const [ownerType] = useQueryState<string>(ownerTypeKey);
  const { resetFilterState } = useFilterContext();
  const previousOwnerTypeRef = useRef(ownerType);

  useEffect(() => {
    if (previousOwnerTypeRef.current !== ownerType && value) {
      setValue(null);
    }
    previousOwnerTypeRef.current = ownerType;
  }, [ownerType, setValue, value]);

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
  const { value, options } = useSelectOwnerContext();
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

const SelectOwnerFilterBar = ({
  queryKey,
  ownerTypeKey,
}: {
  queryKey: string;
  ownerTypeKey: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const [ownerType] = useQueryState<string>(ownerTypeKey);
  const [open, setOpen] = useState(false);
  const previousOwnerTypeRef = useRef(ownerType);

  useEffect(() => {
    if (previousOwnerTypeRef.current !== ownerType && value) {
      setValue(null);
    }
    previousOwnerTypeRef.current = ownerType;
  }, [ownerType, setValue, value]);

  const barLabel = getOwnerBarLabel(ownerType || 'customer');

  return (
    <Filter.BarItem queryKey={queryKey}>
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
            <SelectOwnerBarButton filterKey={queryKey} barLabel={barLabel} />
          </Popover.Trigger>
          <Combobox.Content>
            <SelectOwnerContent />
          </Combobox.Content>
        </Popover>
      </SelectOwnerProvider>
    </Filter.BarItem>
  );
};

const SelectOwnerFormItem = ({
  value,
  onValueChange,
  ownerType = 'customer',
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (val: string, label?: string) => void;
  ownerType?: string;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectOwnerProvider
      value={value}
      ownerType={ownerType}
      onValueChange={(val, label) => {
        onValueChange(val, label);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectOwnerValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectOwnerContent />
        </Combobox.Content>
      </Popover>
    </SelectOwnerProvider>
  );
};

const SelectOwnerRoot = ({
  value,
  ownerType = 'customer',
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  ownerType?: string;
  onValueChange?: (val: string, label?: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectOwnerProvider
      value={value}
      ownerType={ownerType}
      onValueChange={(val, label) => {
        onValueChange?.(val, label);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className={cn('shadow-xs', className)}>
          <SelectOwnerValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectOwnerContent />
        </Combobox.Content>
      </Popover>
    </SelectOwnerProvider>
  );
};

export const SelectOwner = Object.assign(SelectOwnerRoot, {
  Provider: SelectOwnerProvider,
  Value: SelectOwnerValue,
  Content: SelectOwnerContent,
  FilterItem: SelectOwnerFilterItem,
  FilterView: SelectOwnerFilterView,
  FilterBar: SelectOwnerFilterBar,
  FormItem: SelectOwnerFormItem,
});
