import {
  IconCalendar,
  IconLayoutGridAdd,
  IconSearch,
  IconToggleRightFilled,
  IconTypeface,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useMultiQueryState,
} from 'erxes-ui';
import { SelectBranches, SelectCategory, SelectDepartments, SelectMember } from 'ui-modules';
import { useSafeRemainderQueryParams } from '../hooks/useSafeRemainders';

const SafeRemainderDetailFilterPopover = () => {
  const queryParams = useSafeRemainderQueryParams();
  const hasFilters = Object.values(queryParams || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="accounts-filter">
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
                <Filter.Item value="date" inDialog>
                  <IconTypeface />
                  DiffType
                </Filter.Item>
                <Filter.Item value="category">
                  <IconLayoutGridAdd />
                  Category
                </Filter.Item>
                <Filter.Item value="statuses" disabled={true}>
                  <IconToggleRightFilled />
                  Status
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>

          <SelectCategory
            selected=''
            onSelect={() => { }}
            id=''
          />
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

export const SafeRemainderDetailFilter = (
  { afterBar }: { afterBar?: React.ReactNode }
) => {
  const [queries] = useMultiQueryState<{
    number: string;
    searchValue: string;
    accountSearchValue: string;
  }>(['number', 'searchValue', 'accountSearchValue']);

  const { number, searchValue, accountSearchValue } = queries;

  return (
    <Filter id="accounts-filter" >
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
        <Filter.BarItem queryKey="date">
          <Filter.BarName>
            <IconCalendar />
            Date
          </Filter.BarName>
          <Filter.Date filterKey="date" />
        </Filter.BarItem>
        <SelectBranches.FilterBar label='Branch' filterKey='branchId' mode='single' />
        <SelectDepartments.FilterBar label='Department' filterKey='departmentId' mode='single' />

        <SelectMember.FilterBar queryKey='createdUserId' label='Created By' mode='single' />
        <SelectMember.FilterBar queryKey='modifiedUserId' label='Modified By' mode='single' />
        <Filter.BarItem queryKey="createdDate">
          <Filter.BarName>
            <IconCalendar />
            Created date
          </Filter.BarName>
          <Filter.Date filterKey="createdDate" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updatedDate">
          <Filter.BarName>
            <IconCalendar />
            Updated date
          </Filter.BarName>
          <Filter.Date filterKey="updatedDate" />
        </Filter.BarItem>

        <SafeRemainderDetailFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
