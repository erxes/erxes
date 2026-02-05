import {
  Button,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconBuilding, IconPlus } from '@tabler/icons-react';
import {
  SelectCompanyContext,
  useSelectCompanyContext,
} from 'ui-modules/modules/contacts/contexts/SelectCompanyContext';
import { useEffect, useMemo, useState } from 'react';

import { CompaniesInline } from './CompaniesInline';
import { ICompany } from '../types';
import { useCompanies } from 'ui-modules/modules/contacts/hooks/useCompanies';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';

interface SelectCompanyProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  hideAvatar?: boolean;
}

const SelectCompanyProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
  hideAvatar,
}: SelectCompanyProviderProps) => {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const companyIds = useMemo(() => {
    return !value ? [] : Array.isArray(value) ? value : [value];
  }, [value]);

  const { companies: fetchedCompanies } = useCompanies({
    variables: {
      ids: companyIds,
    },
    skip: companyIds.length === 0,
  });

  useEffect(() => {
    if (
      fetchedCompanies &&
      fetchedCompanies.length > 0 &&
      companies.length === 0
    ) {
      setCompanies(fetchedCompanies);
    }
  }, [fetchedCompanies, companyIds, companies.length]);

  const onSelect = (company: ICompany) => {
    if (!company) return;

    const isSingleMode = mode === 'single';
    const multipleValue = (value as string[]) || [];
    const isSelected = !isSingleMode && multipleValue.includes(company._id);

    const newSelectedCompanyIds = isSingleMode
      ? [company._id]
      : isSelected
      ? multipleValue.filter((t) => t !== company._id)
      : [...multipleValue, company._id];

    const newSelectedCompanies = isSingleMode
      ? [company]
      : isSelected
      ? companies.filter((t) => t._id !== company._id)
      : [...companies, company];

    setCompanies(newSelectedCompanies);
    onValueChange?.(isSingleMode ? company._id : newSelectedCompanyIds);
  };

  return (
    <SelectCompanyContext.Provider
      value={{
        companyIds,
        onSelect,
        companies,
        setCompanies,
        loading: false,
        error: null,
        hideAvatar,
        mode,
      }}
    >
      {children}
    </SelectCompanyContext.Provider>
  );
};

const SelectCompanyContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { companyIds, companies } = useSelectCompanyContext();
  const {
    companies: companiesData,
    loading,
    handleFetchMore,
    totalCount,
    error,
  } = useCompanies({
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
        {companies?.length > 0 && (
          <>
            {companies.map((company) => (
              <SelectCompanyCommandItem key={company._id} company={company} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        <Combobox.Empty loading={loading} error={error} />
        {!loading &&
          companiesData
            ?.filter(
              (company) =>
                !companyIds.find((companyId) => companyId === company._id),
            )
            .map((company) => (
              <SelectCompanyCommandItem key={company._id} company={company} />
            ))}

        {!loading && (
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={companiesData.length || 0}
            totalCount={totalCount}
          />
        )}
      </Command.List>
    </Command>
  );
};

const SelectCompanyCommandItem = ({ company }: { company: ICompany }) => {
  const { onSelect, companyIds } = useSelectCompanyContext();
  return (
    <Command.Item
      value={company._id}
      onSelect={() => {
        onSelect(company);
      }}
    >
      <CompaniesInline companies={[company]} placeholder="Unnamed company" />
      <Combobox.Check checked={companyIds.includes(company._id)} />
    </Command.Item>
  );
};

const SelectCompanyInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectCompanyProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCompanyProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectCompany.Value />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectCompany.Content />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectCompanyProvider>
  );
};

const SelectCompanyRoot = ({
  onValueChange,
  className,
  mode = 'single',
  ...props
}: Omit<React.ComponentProps<typeof SelectCompanyProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCompanyProvider
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
          <SelectCompany.Value />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectCompany.Content />
        </Combobox.Content>
      </Popover>
    </SelectCompanyProvider>
  );
};

const SelectCompanyValue = ({ placeholder }: { placeholder?: string }) => {
  const { companyIds, companies, setCompanies, hideAvatar } =
    useSelectCompanyContext();

  if (hideAvatar) {
    return (
      <span className="text-muted-foreground flex items-center gap-1 -ml-1">
        <IconBuilding className="w-4 h-4 text-gray-400" /> Company(s) +
        {companyIds.length}
      </span>
    );
  }

  return (
    <CompaniesInline
      companyIds={companyIds}
      companies={companies}
      updateCompanies={setCompanies}
      placeholder={placeholder || 'Select Company'}
      hideAvatar={hideAvatar}
    />
  );
};

const SelectCompanyBadgesView = () => {
  const { companyIds, companies, setCompanies } = useSelectCompanyContext();
  return (
    <CompaniesInline.Badges
      companyIds={companyIds}
      companies={companies}
      updateCompanies={setCompanies}
    />
  );
};

const SelectCompanyDetail = ({
  onValueChange,
  className,
  mode = 'single',
  ...props
}: Omit<React.ComponentProps<typeof SelectCompanyProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('contact', {
    keyPrefix: 'customer.detail',
  });

  return (
    <SelectCompanyProvider
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
        <Popover.Trigger asChild>
          <Button
            className={cn('w-min inline-flex shadow-xs font-medium', className)}
            variant="outline"
          >
            {t('add-company')}
            <IconPlus className="text-lg" />
          </Button>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectCompany.Content />
        </Combobox.Content>
      </Popover>
      <SelectCompanyBadgesView />
    </SelectCompanyProvider>
  );
};

export const SelectCompanyFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconBuilding />
      {label}
    </Filter.Item>
  );
};

export const SelectCompanyFilterView = ({
  mode,
  filterKey,
}: {
  mode: 'single' | 'multiple';
  filterKey: string;
}) => {
  const [query, setQuery] = useQueryState<string[] | string | undefined>(
    filterKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <SelectCompanyProvider
        mode={mode}
        value={query || []}
        onValueChange={(value) => {
          setQuery(value);
          resetFilterState();
        }}
      >
        <SelectCompany.Content />
      </SelectCompanyProvider>
    </Filter.View>
  );
};

export const SelectCompanyFilterBar = ({
  mode = 'multiple',
  filterKey,
  label,
  variant,
  scope,
  targetId,
  initialValue,
  value,
  onValueChange,
  hideAvatar,
}: {
  mode?: 'single' | 'multiple';
  filterKey: string;
  label: string;
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  targetId?: string;
  initialValue?: string[];
  value?: string[];
  hideAvatar?: boolean;
  onValueChange?: (value: string[] | string) => void;
}) => {
  const isCardVariant = variant === 'card';

  const [localQuery, setLocalQuery] = useState<string[]>(
    value || initialValue || [],
  );
  const [urlQuery, setUrlQuery] = useQueryState<string[]>(filterKey);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isCardVariant) {
      if (value !== undefined) {
        setLocalQuery(value);
      } else if (initialValue) {
        setLocalQuery(initialValue);
      }
    }
  }, [value, initialValue, isCardVariant]);

  const query = isCardVariant ? localQuery : urlQuery;

  if (!query && variant !== 'card') {
    return null;
  }

  const handleValueChange = (value: string[] | string) => {
    if (onValueChange) {
      onValueChange(value);
    }

    if (isCardVariant) {
      setLocalQuery((value as string[]) || []);
    } else {
      if (value && value.length > 0) {
        setUrlQuery(value as string[]);
      } else {
        setUrlQuery(null);
      }
    }
  };

  return (
    <SelectCompanyProvider
      mode={mode}
      value={query || []}
      onValueChange={handleValueChange}
      hideAvatar={hideAvatar}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant || 'filter'}>
          <SelectCompany.Value />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant || 'filter'}>
          <SelectCompany.Content />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectCompanyProvider>
  );
};

export const SelectCompany = Object.assign(SelectCompanyRoot, {
  Provider: SelectCompanyProvider,
  Content: SelectCompanyContent,
  Item: SelectCompanyCommandItem,
  InlineCell: SelectCompanyInlineCell,
  Value: SelectCompanyValue,
  Badges: SelectCompanyBadgesView,
  Detail: SelectCompanyDetail,
  FilterItem: SelectCompanyFilterItem,
  FilterView: SelectCompanyFilterView,
  FilterBar: SelectCompanyFilterBar,
});
