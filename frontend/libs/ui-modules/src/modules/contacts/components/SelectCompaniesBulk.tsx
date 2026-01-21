import {
  Button,
  Input,
  ScrollArea,
  Separator,
  Sheet,
  Spinner,
  Tooltip,
  cn,
} from 'erxes-ui';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { CompaniesInline } from './CompaniesInline';
import { ICompany } from '../types/Company';
import { useCompanies } from '../hooks/useCompanies';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';

interface SelectCompaniesProps {
  onSelect: (companyIds: string[], companies?: ICompany[]) => void;
  children: React.ReactNode;
  companyIds?: string[];
}

interface CompaniesListProps {
  selectedCompanies: ICompany[];
  setSelectedCompanies: React.Dispatch<React.SetStateAction<ICompany[]>>;
  selectedCompanyIds: string[];
  setSelectedCompanyIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SelectCompaniesBulk = ({
  onSelect,
  children,
  companyIds,
}: SelectCompaniesProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="sm:max-w-5xl">
        <Sheet.Header>
          <Sheet.Title>Select Companies</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <SelectCompaniesBulkContent
          setOpen={setOpen}
          onSelect={onSelect}
          companyIds={companyIds}
        />
      </Sheet.View>
    </Sheet>
  );
};

const SelectCompaniesBulkContent = ({
  setOpen,
  onSelect,
  companyIds,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (companyIds: string[], companies?: ICompany[]) => void;
  companyIds?: string[];
}) => {
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<ICompany[]>([]);

  useEffect(() => {
    if (companyIds?.length) {
      setSelectedCompanyIds([...new Set(companyIds)]);
    }
  }, [companyIds]);

  const handleSelect = () => {
    onSelect(
      selectedCompanyIds,
      selectedCompanies.filter((c) => selectedCompanyIds.includes(c._id)),
    );
    setOpen(false);
  };

  return (
    <>
      <Sheet.Content className="grid grid-cols-2 overflow-hidden">
        <CompaniesList
          selectedCompanies={selectedCompanies}
          selectedCompanyIds={selectedCompanyIds}
          setSelectedCompanyIds={setSelectedCompanyIds}
          setSelectedCompanies={setSelectedCompanies}
        />
        <SelectedCompaniesList
          selectedCompanies={selectedCompanies}
          selectedCompanyIds={selectedCompanyIds}
          setSelectedCompanyIds={setSelectedCompanyIds}
          setSelectedCompanies={setSelectedCompanies}
        />
      </Sheet.Content>
      <Sheet.Footer className="sm:justify-end">
        <div className="flex items-center gap-2">
          <Sheet.Close asChild>
            <Button variant="secondary" className="bg-border">
              Cancel
            </Button>
          </Sheet.Close>
          <Button onClick={handleSelect}>Add Many Companies</Button>
        </div>
      </Sheet.Footer>
    </>
  );
};

const CompaniesList = ({
  selectedCompanies,
  selectedCompanyIds,
  setSelectedCompanyIds,
  setSelectedCompanies,
}: CompaniesListProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const { companies, handleFetchMore, totalCount } = useCompanies({
    variables: { searchValue: debouncedSearch },
  });

  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  const handleCompanySelect = (company: ICompany) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(company._id) ? prev : [...prev, company._id],
    );

    setSelectedCompanies((prev) => {
      if (prev.some((c) => c._id === company._id)) return prev;
      return [...prev, company];
    });
  };

  const getCompanyTitle = (company: ICompany) => {
    const { primaryName, primaryEmail, primaryPhone } = company;
    return (
      (primaryName || primaryEmail || primaryPhone
        ? `${primaryName || ''} ${primaryEmail || ''} ${
            primaryPhone || ''
          }`.trim()
        : primaryEmail || primaryPhone) || 'anonymous company'
    );
  };

  return (
    <div className="border-r overflow-hidden flex flex-col">
      <div className="p-4">
        <Input
          placeholder="Search customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-accent-foreground text-xs mt-4">
          {totalCount} results
        </div>
      </div>

      <Separator />

      <ScrollArea>
        <div className="p-4 flex flex-col gap-1">
          <Tooltip.Provider>
            {companies.map((company) => {
              const isSelected = selectedCompanyIds.includes(company._id);

              return (
                <Tooltip key={company._id}>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'min-h-9 h-auto justify-start font-normal',
                        isSelected && 'bg-primary/10',
                      )}
                      onClick={() => handleCompanySelect(company)}
                    >
                      {getCompanyTitle(company)}
                      {isSelected ? (
                        <IconCheck className="ml-auto" />
                      ) : (
                        <IconPlus className="ml-auto" />
                      )}
                    </Button>
                  </Tooltip.Trigger>

                  <Tooltip.Content>
                    <span className="opacity-50">#</span>{' '}
                    {company.code || company._id}
                  </Tooltip.Content>
                </Tooltip>
              );
            })}

            {companies.length < totalCount && (
              <div ref={bottomRef} className="flex items-center gap-2 h-8">
                <Spinner />
                <span className="text-accent-foreground animate-pulse">
                  Loading more companies...
                </span>
              </div>
            )}
          </Tooltip.Provider>
        </div>
      </ScrollArea>
    </div>
  );
};

const SelectedCompaniesList = ({
  selectedCompanies,
  selectedCompanyIds,
  setSelectedCompanyIds,
  setSelectedCompanies,
}: CompaniesListProps) => {
  const handleRemoveCompany = (companyId: string) => {
    setSelectedCompanies((prev) => prev.filter((c) => c._id !== companyId));
    setSelectedCompanyIds((prev) => prev.filter((id) => id !== companyId));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 flex flex-col gap-1">
        <div className="text-accent-foreground text-xs px-3 mb-1">Added</div>
        {selectedCompanyIds.map((companyId) => {
          return (
            <Button
              key={companyId}
              variant="ghost"
              className="min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left"
              onClick={() => handleRemoveCompany(companyId)}
            >
              <CompaniesInline companyIds={[companyId]} />
              <IconX className="ml-auto" />
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
