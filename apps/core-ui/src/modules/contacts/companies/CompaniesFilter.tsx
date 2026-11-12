import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, isUndefinedOrNull, Skeleton, useFilterQueryState, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TagsFilter } from '~/modules/tags/TagsSelect';
import { SelectMember } from '../components/SelectMember';
import { COMPANIES_SESSION_KEY, useCompanies } from './useCompanies';
import { formatTotal } from '~/lib/cursorList';
import { AdvancedFilterButton, SaveViewButton } from '../views/ViewControls';
import { LeadStageFilter } from '~/modules/leads/LeadStageFilter';
import { LeadDisplayMenu } from '~/modules/leads/LeadDisplayMenu';

export const CompaniesTotalCount = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { totalCount, totalCapped } = useCompanies(state);

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        t('records-found', { count: totalCount, formatted: formatTotal(totalCount, totalCapped) })
      )}
    </div>
  );
};

// Core lists filter by search, tags and owner; old erxes's date filters need
// list filters core does not have yet.
const CompaniesFilterPopover = ({ state }: { state: 'lead' | 'customer' }) => {
  const [queries] = useMultiQueryState<{ tags: string[]; searchValue: string; ownerId: string; stage: string }>([
    'tags',
    'searchValue',
    'ownerId',
    'stage',
  ]);
  const hasFilters = Object.values(queries || {}).some((value) => value !== null);
  const { t } = useTranslation('contact', { keyPrefix: 'filter' });
  const { t: companyT } = useTranslation('contact', { keyPrefix: 'company' });

  return (
    <>
      <Filter.Popover scope={state === 'lead' ? 'company-leads-page' : 'companies-page'}>
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
                {state === 'lead' && <LeadStageFilter.Item />}
                <TagsFilter />
                <SelectMember.FilterItem label={companyT('owner')} />
              </Command.List>
            </Command>
          </Filter.View>
          {state === 'lead' && <LeadStageFilter.View />}
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

export const CompaniesFilter = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'filter' });
  const { t: companyT } = useTranslation('contact', { keyPrefix: 'company' });
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter id={state === 'lead' ? 'company-leads-filter' : 'companies-filter'} sessionKey={state === 'lead' ? 'core_company_leads_cursor' : COMPANIES_SESSION_KEY}>
      <Filter.Bar>
        <CompaniesFilterPopover state={state} />
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        {state === 'lead' && <LeadStageFilter.Bar />}
        <TagsFilter.Bar type="company" />
        <SelectMember.FilterBar label={companyT('owner')} />
        <AdvancedFilterButton recordType="company" />
        <CompaniesTotalCount state={state} />
        <SaveViewButton recordType="company" />
        {state === 'lead' && <LeadDisplayMenu />}
      </Filter.Bar>
    </Filter>
  );
};
