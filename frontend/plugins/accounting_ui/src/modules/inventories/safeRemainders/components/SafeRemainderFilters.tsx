import {
  IconCalendar,
  IconSearch,
  IconToggleRightFilled,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectBranches, SelectDepartments, SelectMember } from 'ui-modules';
import { useSafeRemainderQueryParams } from '../hooks/useSafeRemainders';

const SafeRemainderFilterPopover = () => {
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
                  <IconCalendar />
                  Date
                </Filter.Item>
                <SelectBranches.FilterItem value="branchId" label="Branch" />
                <SelectDepartments.FilterItem
                  value="departmentId"
                  label="Department"
                />
                <Filter.Item value="statuses" disabled={true}>
                  <IconToggleRightFilled />
                  Statuses
                </Filter.Item>

                <Command.Separator className="my-1" />
                <SelectMember.FilterItem
                  value="createdUserId"
                  label="Created by"
                />
                <SelectMember.FilterItem
                  value="modifiedUserId"
                  label="Modified by"
                />
                <Filter.Item value="updatedDate" inDialog>
                  <IconCalendar />
                  Updated
                </Filter.Item>
                <Filter.Item value="createdDate" inDialog>
                  <IconCalendar />
                  Created
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="date">
            <Filter.DateView filterKey="date" />
          </Filter.View>
          <SelectBranches.FilterView mode="single" filterKey="branchId" />
          <SelectDepartments.FilterView
            mode="single"
            filterKey="departmentId"
          />

          <SelectMember.FilterView mode="single" queryKey="createdUserId" />
          <SelectMember.FilterView mode="single" queryKey="modifiedUserId" />
          <Filter.View filterKey="updatedDate">
            <Filter.DateView filterKey="updatedDate" />
          </Filter.View>
          <Filter.View filterKey="createdDate">
            <Filter.DateView filterKey="createdDate" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="date" inDialog>
          <Filter.DialogDateView filterKey="date" />
        </Filter.View>
        <Filter.View filterKey="updatedDate" inDialog>
          <Filter.DialogDateView filterKey="updatedDate" />
        </Filter.View>
        <Filter.View filterKey="createdDate" inDialog>
          <Filter.DialogDateView filterKey="createdDate" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const SafeRemainderFilter = ({
  afterBar,
}: {
  afterBar?: React.ReactNode;
}) => {
  const [queries] = useMultiQueryState<{
    number: string;
    searchValue: string;
    accountSearchValue: string;
  }>(['number', 'searchValue', 'accountSearchValue']);

  const {  searchValue } = queries;

  return (
    <Filter id="accounts-filter">
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
        <SelectBranches.FilterBar
          label="Branch"
          filterKey="branchId"
          mode="single"
        />
        <SelectDepartments.FilterBar
          label="Department"
          filterKey="departmentId"
          mode="single"
        />

        <SelectMember.FilterBar
          queryKey="createdUserId"
          label="Created By"
          mode="single"
        />
        <SelectMember.FilterBar
          queryKey="modifiedUserId"
          label="Modified By"
          mode="single"
        />
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

        <SafeRemainderFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
