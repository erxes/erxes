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

import { IconBuilding } from '@tabler/icons-react';
import { POS_COMPANIES_QUERY } from '../../graphql/queries/posCompaniesQuery';
import { useQuery } from '@apollo/client';
import {
  SelectContent,
  SelectTrigger,
  SelectTriggerVariantType,
} from './SelectShared';

interface ICompany {
  _id: string;
  primaryName: string;
  names?: string[];
  avatar?: string;
  size?: string;
  website?: string;
  industry?: string;
  businessType?: string;
  status?: string;
  code?: string;
  location?: string;
  getTags?: Array<{
    _id: string;
    name: string;
    colorCode?: string;
  }>;
}

interface SelectCompaniesContextType {
  value: string;
  onValueChange: (company: string) => void;
  companies?: ICompany[];
  loading?: boolean;
}

const SelectCompaniesContext = createContext<SelectCompaniesContextType | null>(
  null,
);

const useSelectCompaniesContext = () => {
  const context = useContext(SelectCompaniesContext);
  if (!context) {
    throw new Error(
      'useSelectCompaniesContext must be used within SelectCompaniesProvider',
    );
  }
  return context;
};

export const SelectCompaniesProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
  searchValue,
}: {
  value: string | string[];
  onValueChange: (company: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  searchValue?: string;
}) => {
  const { data, loading } = useQuery(POS_COMPANIES_QUERY, {
    variables: {
      limit: 100,
      searchValue,
    },
  });

  const companies = useMemo(
    () => data?.companies?.list || [],
    [data?.companies?.list],
  );

  const handleValueChange = useCallback(
    (company: string) => {
      if (!company) return;
      onValueChange?.(company);
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
      companies,
      loading,
    }),
    [value, handleValueChange, companies, loading, mode],
  );

  return (
    <SelectCompaniesContext.Provider value={contextValue}>
      {children}
    </SelectCompaniesContext.Provider>
  );
};

const SelectCompaniesValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, companies } = useSelectCompaniesContext();
  const selectedCompany = companies?.find((company) => company._id === value);

  if (!selectedCompany) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select company'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>
        {selectedCompany.primaryName}
      </p>
    </div>
  );
};

const SelectCompaniesCommandItem = ({ company }: { company: ICompany }) => {
  const { onValueChange, value } = useSelectCompaniesContext();
  const { _id, primaryName } = company || {};
  const isChecked = value.split(',').includes(_id);

  return (
    <Command.Item
      value={_id}
      onSelect={() => {
        onValueChange(_id);
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{primaryName}</span>
      </div>
      <Combobox.Check checked={isChecked} />
    </Command.Item>
  );
};

const SelectCompaniesContent = () => {
  const { companies, loading } = useSelectCompaniesContext();

  if (loading) {
    return (
      <Command>
        <Command.Input placeholder="Search companies" />
        <Command.List>
          <div className="flex items-center justify-center py-4 h-32">
            <span className="text-muted-foreground">Loading companies...</span>
          </div>
        </Command.List>
      </Command>
    );
  }

  return (
    <Command>
      <Command.Input placeholder="Search companies" />
      <Command.Empty>
        <span className="text-muted-foreground">No companies found</span>
      </Command.Empty>
      <Command.List>
        {companies?.map((company) => (
          <SelectCompaniesCommandItem key={company._id} company={company} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectCompaniesFilterItem = () => {
  return (
    <Filter.Item value="companies">
      <IconBuilding />
      Companies
    </Filter.Item>
  );
};

export const SelectCompaniesFilterView = ({
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
  const [companies, setCompanies] = useQueryState<string[] | string>(
    queryKey || 'companies',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'companies'}>
      <SelectCompaniesProvider
        mode={mode}
        value={companies || (mode === 'single' ? '' : [])}
        searchValue={searchValue}
        onValueChange={(value) => {
          setCompanies(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectCompaniesContent />
      </SelectCompaniesProvider>
    </Filter.View>
  );
};

export const SelectCompaniesFilterBar = ({
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
  const [companies, setCompanies] = useQueryState<string[] | string>(
    'companies',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={'companies'}>
      <Filter.BarName>
        <IconBuilding />
        Companies
      </Filter.BarName>
      <SelectCompaniesProvider
        mode={mode}
        value={companies || (mode === 'single' ? '' : [])}
        searchValue={searchValue}
        onValueChange={(value) => {
          if (value.length > 0) {
            setCompanies(value as string[] | string);
          } else {
            setCompanies(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'companies'}>
              <SelectCompaniesValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectCompaniesContent />
          </Combobox.Content>
        </Popover>
      </SelectCompaniesProvider>
    </Filter.BarItem>
  );
};

export const SelectCompaniesFormItem = ({
  onValueChange,
  className,
  placeholder,
  searchValue,
  ...props
}: Omit<React.ComponentProps<typeof SelectCompaniesProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  searchValue?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCompaniesProvider
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
            <SelectCompaniesValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectCompaniesContent />
        </Combobox.Content>
      </Popover>
    </SelectCompaniesProvider>
  );
};

SelectCompaniesFormItem.displayName = 'SelectCompaniesFormItem';

const SelectCompaniesRoot = ({
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
    <SelectCompaniesProvider
      value={value}
      searchValue={searchValue}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectCompaniesValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectCompaniesContent />
        </SelectContent>
      </PopoverScoped>
    </SelectCompaniesProvider>
  );
};

export const SelectCompanies = Object.assign(SelectCompaniesRoot, {
  Provider: SelectCompaniesProvider,
  Value: SelectCompaniesValue,
  Content: SelectCompaniesContent,
  FilterItem: SelectCompaniesFilterItem,
  FilterView: SelectCompaniesFilterView,
  FilterBar: SelectCompaniesFilterBar,
  FormItem: SelectCompaniesFormItem,
});
