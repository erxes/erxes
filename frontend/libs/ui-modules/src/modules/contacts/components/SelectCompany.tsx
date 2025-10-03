import { ICompany } from '../types';
import {
  SelectCompanyContext,
  useSelectCompanyContext,
} from 'ui-modules/modules/contacts/contexts/SelectCompanyContext';
import { useCompanies } from 'ui-modules/modules/contacts/hooks/useCompanies';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';
import {
  Button,
  cn,
  Combobox,
  Command,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { CompaniesInline } from './CompaniesInline';
import { IconPlus } from '@tabler/icons-react';

interface SelectCompanyProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}

const SelectCompanyProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
}: SelectCompanyProviderProps) => {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const companyIds = !value ? [] : Array.isArray(value) ? value : [value];
  const onSelect = (company: ICompany) => {
    if (!company) return;
    if (mode === 'single') {
      setCompanies([company]);
      onValueChange?.(company._id);
      return;
    }
    const arrayValue = Array.isArray(value) ? value : [];
    const isCompanySelected = arrayValue.includes(company._id);
    const newSelectedCompanyIds = isCompanySelected
      ? arrayValue.filter((id) => id !== company._id)
      : [...arrayValue, company._id];

    setCompanies((prevCompanies) => {
      const companyMap = new Map(prevCompanies.map((c) => [c._id, c]));
      companyMap.set(company._id, company);
      return newSelectedCompanyIds
        .map((id) => companyMap.get(id))
        .filter((c): c is ICompany => c !== undefined);
    });
    onValueChange?.(newSelectedCompanyIds);
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

const SelectCompanyValue = () => {
  const { companyIds, companies, setCompanies } = useSelectCompanyContext();
  return (
    <CompaniesInline
      companyIds={companyIds}
      companies={companies}
      updateCompanies={setCompanies}
    />
  );
};

// const SelectCompanyList = () => {
//   const { companyIds, companies, setCompanies } = useSelectCompanyContext();
//   return (
//     <Badge></Badge>
//   );
// };

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
            Add Companies
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

export const SelectCompany = Object.assign(SelectCompanyRoot, {
  Provider: SelectCompanyProvider,
  Content: SelectCompanyContent,
  Item: SelectCompanyCommandItem,
  InlineCell: SelectCompanyInlineCell,
  Value: SelectCompanyValue,
  Badges: SelectCompanyBadgesView,
  Detail: SelectCompanyDetail,
});
