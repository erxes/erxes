import {
  AccountsFilterCurrency,
  AccountsFilterTrJournal,
  FilterBarCurrency,
  FilterBarTrJournal
} from '@/settings/account/components/filters/FilterHelpers';
import {
  IconCalendar,
  IconCoins,
  IconHash,
  IconLabelFilled,
  IconLayoutGridAdd,
  IconNotebook,
  IconNumber,
  IconSearch,
  IconToggleRightFilled,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useMultiQueryState,
} from 'erxes-ui';
import { SelectBranches, SelectDepartments, SelectMember } from 'ui-modules';
import { SelectAccount } from '~/modules/settings/account/components/SelectAccount';
import { useTransactionsQueryParams } from '../hooks/useTransactionVars';

const TransactionsFilterPopover = () => {
  const queryParams = useTransactionsQueryParams();
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
                <Filter.Item value="number" inDialog>
                  <IconNumber />
                  Number
                </Filter.Item>
                <Filter.Item value="date" inDialog>
                  <IconCalendar />
                  Date
                </Filter.Item>
                <SelectBranches.FilterItem value="branchId" label="Branch" />
                <SelectDepartments.FilterItem value="departmentId" label="Department" />
                <Filter.Item value="currency">
                  <IconCoins />
                  Currency
                </Filter.Item>
                <Filter.Item value="journal">
                  <IconNotebook />
                  Journal
                </Filter.Item>
                <Filter.Item value="statuses" disabled={true}>
                  <IconToggleRightFilled />
                  Statuses
                </Filter.Item>

                <Command.Separator className="my-1" />
                <SelectAccount.FilterItem value='accountIds' />
                <Filter.Item value="accountKind" disabled={true}>
                  <IconToggleRightFilled />
                  Account Kind
                </Filter.Item>
                <Filter.Item value="accountStatus" disabled={true}>
                  <IconToggleRightFilled />
                  Account Status
                </Filter.Item>
                <Filter.Item value="accountCategoryId" disabled={true}>
                  <IconLayoutGridAdd />
                  Account Category
                </Filter.Item>
                <Filter.Item value="accountSearchValue" inDialog>
                  <IconSearch />
                  Account Search
                </Filter.Item>
                <Filter.Item value="isOutBalance" disabled={true}>
                  <IconToggleRightFilled />
                  Is Out Balance
                </Filter.Item>

                <Command.Separator className="my-1" />
                <SelectMember.FilterItem value='createdUserId' label='Created by' />
                <SelectMember.FilterItem value='modifiedUserId' label='Modified by' />
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
          <SelectBranches.FilterView mode='single' filterKey='branchId' />
          <SelectDepartments.FilterView mode='single' filterKey='departmentId' />
          <Filter.View filterKey="currency">
            <AccountsFilterCurrency />
          </Filter.View>
          <Filter.View filterKey="journal">
            <AccountsFilterTrJournal />
          </Filter.View>
          <SelectAccount.FilterView mode='multiple' queryKey='accountIds' />

          <SelectMember.FilterView mode='single' queryKey='createdUserId' />
          <SelectMember.FilterView mode='single' queryKey='modifiedUserId' />
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
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
        <Filter.View filterKey="accountSearchValue" inDialog>
          <Filter.DialogStringView filterKey="accountSearchValue" />
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

export const TransactionsFilter = (
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
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            Number
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
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
        <FilterBarCurrency />
        <FilterBarTrJournal />

        <SelectAccount.FilterBar queryKey='accountIds' mode='multiple' />
        <Filter.BarItem queryKey="accountSearchValue">
          <Filter.BarName>
            <IconLabelFilled />
            Account Search
          </Filter.BarName>
          <Filter.BarButton filterKey="accountSearchValue" inDialog>
            {accountSearchValue}
          </Filter.BarButton>
        </Filter.BarItem>

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

        <TransactionsFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
