import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, isUndefinedOrNull, Skeleton, useFilterQueryState, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TagsFilter } from '~/modules/tags/TagsSelect';
import { SelectMember } from '../components/SelectMember';
import { COMPANIES_SESSION_KEY, useCompanies } from './useCompanies';
import { AdvancedFilterButton, SaveViewButton } from '../views/ViewControls';

export const CompaniesTotalCount = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { totalCount } = useCompanies();

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        t('records-found', { count: totalCount })
      )}
    </div>
  );
};

// Core lists filter by search, tags and owner; old erxes's date filters need
// list filters core does not have yet.
const CompaniesFilterPopover = () => {
  const [queries] = useMultiQueryState<{ tags: string[]; searchValue: string; ownerId: string }>([
    'tags',
    'searchValue',
    'ownerId',
  ]);
  const hasFilters = Object.values(queries || {}).some((value) => value !== null);
  const { t } = useTranslation('contact', { keyPrefix: 'filter' });
  const { t: companyT } = useTranslation('contact', { keyPrefix: 'company' });

  return (
    <>
      <Filter.Popover scope="companies-page">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder={t('_')} variant="secondary" className="bg-background" />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <TagsFilter />
                <SelectMember.FilterItem label={companyT('owner')} />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectMember.FilterView />
          <TagsFilter.View type="company" />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const CompaniesFilter = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'filter' });
  const { t: companyT } = useTranslation('contact', { keyPrefix: 'company' });
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter id="companies-filter" sessionKey={COMPANIES_SESSION_KEY}>
      <Filter.Bar>
        <CompaniesFilterPopover />
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <TagsFilter.Bar type="company" />
        <SelectMember.FilterBar label={companyT('owner')} />
        <AdvancedFilterButton recordType="company" />
        <CompaniesTotalCount />
        <SaveViewButton recordType="company" />
      </Filter.Bar>
    </Filter>
  );
};
