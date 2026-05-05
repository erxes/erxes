import {
  AccountsFilterCurrency,
  AccountsFilterTrJournal,
  FilterBarCurrency,
  FilterBarTrJournal,
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
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
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
                placeholder="Шүүлтүүр"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Хайх
                </Filter.Item>
                <Filter.Item value="number" inDialog>
                  <IconNumber />
                  Дугаар
                </Filter.Item>
                <Filter.Item value="date" inDialog>
                  <IconCalendar />
                  Огноо
                </Filter.Item>
                <SelectBranches.FilterItem value="branchId" label="Салбар" />
                <SelectDepartments.FilterItem
                  value="departmentId"
                  label="Хэлтэс"
                />
                <Filter.Item value="currency">
                  <IconCoins />
                  Валют
                </Filter.Item>
                <Filter.Item value="journal">
                  <IconNotebook />
                  Журнал
                </Filter.Item>
                <Filter.Item value="statuses" disabled={true}>
                  <IconToggleRightFilled />
                  Төлөв
                </Filter.Item>

                <Command.Separator className="my-1" />
                <SelectAccount.FilterItem value="accountIds" />
                <Filter.Item value="accountKind" disabled={true}>
                  <IconToggleRightFilled />
                  Дансны төрөл
                </Filter.Item>
                <Filter.Item value="accountStatus" disabled={true}>
                  <IconToggleRightFilled />
                  Дансны төлөв
                </Filter.Item>
                <Filter.Item value="accountCategoryId" disabled={true}>
                  <IconLayoutGridAdd />
                  Дансны ангилал
                </Filter.Item>
                <Filter.Item value="accountSearchValue" inDialog>
                  <IconSearch />
                  Данс хайх
                </Filter.Item>
                <Filter.Item value="isOutBalance" disabled={true}>
                  <IconToggleRightFilled />
                  Баланс бус эсэх
                </Filter.Item>

                <Command.Separator className="my-1" />
                <SelectMember.FilterItem
                  value="createdUserId"
                  label="Үүсгэсэн"
                />
                <SelectMember.FilterItem
                  value="modifiedUserId"
                  label="Өөрчилсөн"
                />
                <Filter.Item value="updatedDate" inDialog>
                  <IconCalendar />
                  Өөрчилсөн
                </Filter.Item>
                <Filter.Item value="createdDate" inDialog>
                  <IconCalendar />
                  Үүсгэсэн
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
          <Filter.View filterKey="currency">
            <AccountsFilterCurrency />
          </Filter.View>
          <Filter.View filterKey="journal">
            <AccountsFilterTrJournal />
          </Filter.View>
          <SelectAccount.FilterView mode="multiple" queryKey="accountIds" />

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

export const TransactionsFilter = ({
  afterBar,
}: {
  afterBar?: React.ReactNode;
}) => {
  const [queries] = useMultiQueryState<{
    number: string;
    searchValue: string;
    accountSearchValue: string;
  }>(['number', 'searchValue', 'accountSearchValue']);

  const { number, searchValue, accountSearchValue } = queries;

  return (
    <Filter id="accounts-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            Хайх
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            Дугаар
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="date">
          <Filter.BarName>
            <IconCalendar />
            Огноо
          </Filter.BarName>
          <Filter.Date filterKey="date" />
        </Filter.BarItem>
        <SelectBranches.FilterBar
          label="Салбар"
          filterKey="branchId"
          mode="single"
        />
        <SelectDepartments.FilterBar
          label="Хэлтэс"
          filterKey="departmentId"
          mode="single"
        />
        <FilterBarCurrency />
        <FilterBarTrJournal />

        <SelectAccount.FilterBar queryKey="accountIds" mode="multiple" />
        <Filter.BarItem queryKey="accountSearchValue">
          <Filter.BarName>
            <IconLabelFilled />
            Данс хайх
          </Filter.BarName>
          <Filter.BarButton filterKey="accountSearchValue" inDialog>
            {accountSearchValue}
          </Filter.BarButton>
        </Filter.BarItem>

        <SelectMember.FilterBar
          queryKey="createdUserId"
          label="Үүсгэсэн"
          mode="single"
        />
        <SelectMember.FilterBar
          queryKey="modifiedUserId"
          label="Өөрчилсөн"
          mode="single"
        />
        <Filter.BarItem queryKey="createdDate">
          <Filter.BarName>
            <IconCalendar />
            Үүсгэсэн огноо
          </Filter.BarName>
          <Filter.Date filterKey="createdDate" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updatedDate">
          <Filter.BarName>
            <IconCalendar />
            Өөрчилсөн огноо
          </Filter.BarName>
          <Filter.Date filterKey="updatedDate" />
        </Filter.BarItem>

        <TransactionsFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
