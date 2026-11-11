import type { CustomerState } from '@erxes/core-contract';
import { IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  isUndefinedOrNull,
  Skeleton,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TagsFilter } from '~/modules/tags/TagsSelect';
import { SelectMember } from '../components/SelectMember';
import { customersSessionKey, useCustomers } from './useCustomers';

export const CustomerTotalCount = ({ state }: { state: CustomerState }) => {
  const { t } = useTranslation();
  const { totalCount } = useCustomers(state);

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        `${totalCount} ${t('records-found')}`
      )}
    </div>
  );
};

// Core lists filter by search, tags and owner; old erxes's date, brand,
// segment and property filters need list filters core does not have yet.
const CustomersFilterPopover = ({ state }: { state: CustomerState }) => {
  const { t } = useTranslation('common');
  const { t: contactT } = useTranslation('contact', { keyPrefix: 'customer' });
  const [queries] = useMultiQueryState<{ tags: string[]; searchValue: string; ownerId: string }>([
    'tags',
    'searchValue',
    'ownerId',
  ]);
  const hasFilters = Object.values(queries || {}).some((value) => value !== null);

  return (
    <>
      <Filter.Popover scope={`${state}s-page`}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter._')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('filter.search')}
                </Filter.Item>
                <TagsFilter />
                <SelectMember.FilterItem label={contactT('owner')} />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectMember.FilterView />
          <TagsFilter.View type="customer" />
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

export const CustomersFilter = ({ state }: { state: CustomerState }) => {
  const { t } = useTranslation('common');
  const { t: contactT } = useTranslation('contact', { keyPrefix: 'customer' });
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter id={`${state}s-filter`} sessionKey={customersSessionKey(state)}>
      <Filter.Bar>
        <CustomersFilterPopover state={state} />
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('filter.search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <TagsFilter.Bar type="customer" />
        <SelectMember.FilterBar label={contactT('owner')} />
        <CustomerTotalCount state={state} />
      </Filter.Bar>
    </Filter>
  );
};
