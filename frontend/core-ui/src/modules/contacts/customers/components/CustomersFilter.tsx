import {
  IconCalendar,
  IconCalendarPlus,
  IconCalendarTime,
  IconCalendarUp,
  IconLabel,
  IconSearch,
} from '@tabler/icons-react';

import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';

import { SelectMember, TagsFilter, SelectBrand } from 'ui-modules';
import { CustomerTotalCount } from './CustomerTotalCount';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';

const CustomersFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    tags: string[];
    searchValue: string;
    created: string;
    updated: string;
    lastSeen: string;
    brand: string;
  }>(['tags', 'searchValue', 'created', 'updated', 'lastSeen', 'brand']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={ContactsHotKeyScope.CustomersPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <TagsFilter />
                <Filter.Item value="brand">
                  <IconLabel />
                  Brand
                </Filter.Item>
                <SelectMember.FilterItem />
                <Command.Separator className="my-1" />
                <Filter.Item value="created">
                  <IconCalendarPlus />
                  Created At
                </Filter.Item>
                <Filter.Item value="updated">
                  <IconCalendarUp />
                  Updated At
                </Filter.Item>
                <Filter.Item value="lastSeen">
                  <IconCalendarTime />
                  Last Seen At
                </Filter.Item>
                <Filter.Item value="birthday">
                  <IconCalendar />
                  Birthday
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectMember.FilterView />
          <SelectBrand.FilterView />
          <TagsFilter.View tagType="core:customer" />
          <Filter.View filterKey="created">
            <Filter.DateView filterKey="created" />
          </Filter.View>
          <Filter.View filterKey="updated">
            <Filter.DateView filterKey="updated" />
          </Filter.View>
          <Filter.View filterKey="lastSeen">
            <Filter.DateView filterKey="lastSeen" />
          </Filter.View>
          <Filter.View filterKey="birthday">
            <Filter.DateView filterKey="birthday" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="created" inDialog>
          <Filter.DialogDateView filterKey="created" />
        </Filter.View>
        <Filter.View filterKey="updated" inDialog>
          <Filter.DialogDateView filterKey="updated" />
        </Filter.View>
        <Filter.View filterKey="lastSeen" inDialog>
          <Filter.DialogDateView filterKey="lastSeen" />
        </Filter.View>
        <Filter.View filterKey="birthday" inDialog>
          <Filter.DialogDateView filterKey="birthday" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const CustomersFilter = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');
  const { sessionKey } = useIsCustomerLeadSessionKey();

  return (
    <Filter id="customers-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            Search
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <TagsFilter.Bar tagType="core:customer" />
        <Filter.BarItem queryKey="created">
          <Filter.BarName>
            <IconCalendarPlus />
            Created At
          </Filter.BarName>
          <Filter.Date filterKey="created" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updated">
          <Filter.BarName>
            <IconCalendarUp />
            Updated At
          </Filter.BarName>
          <Filter.Date filterKey="updated" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="lastSeen">
          <Filter.BarName>
            <IconCalendarTime />
            Last Seen At
          </Filter.BarName>
          <Filter.Date filterKey="lastSeen" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="birthday">
          <Filter.BarName>
            <IconCalendar />
            Birthday
          </Filter.BarName>
          <Filter.Date filterKey="birthday" />
        </Filter.BarItem>
        <SelectMember.FilterBar />
        <SelectBrand.FilterBar />
        <CustomersFilterPopover />
        <CustomerTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
