import { useTranslation } from 'react-i18next';
import {
  AccountsFilterCurrency,
  AccountsFilterTrJournal,
  AccountsFilterTrStatus,
  FilterBarCurrency,
  FilterBarTrJournal,
  FilterBarTrStatus,
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
  const { t } = useTranslation('accounting');
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
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <Filter.Item value="number" inDialog>
                  <IconNumber />
                  {t('number')}
                </Filter.Item>
                <Filter.Item value="date" inDialog>
                  <IconCalendar />
                  {t('date')}
                </Filter.Item>
                <SelectBranches.FilterItem
                  value="branchId"
                  label={t('branch')}
                />
                <SelectDepartments.FilterItem
                  value="departmentId"
                  label={t('department')}
                />
                <Filter.Item value="currency">
                  <IconCoins />
                  {t('currency')}
                </Filter.Item>
                <Filter.Item value="journal">
                  <IconNotebook />
                  {t('journal')}
                </Filter.Item>

                <Command.Separator className="my-1" />
                <Filter.Item value="statuses">
                  <IconToggleRightFilled />
                  {t('status')}
                </Filter.Item>
                <SelectMember.FilterItem
                  value="mentionOwnerId"
                  label={t('performed-by')}
                />
                <SelectMember.FilterItem
                  value="mentionUserId"
                  label={t('approver')}
                />

                <Command.Separator className="my-1" />
                <SelectAccount.FilterItem value="accountIds" />
                <Filter.Item value="accountKind" disabled={true}>
                  <IconToggleRightFilled />
                  {t('account-type')}
                </Filter.Item>
                <Filter.Item value="accountStatus" disabled={true}>
                  <IconToggleRightFilled />
                  {t('account-status')}
                </Filter.Item>
                <Filter.Item value="accountCategoryId" disabled={true}>
                  <IconLayoutGridAdd />
                  {t('account-category')}
                </Filter.Item>
                <Filter.Item value="accountSearchValue" inDialog>
                  <IconSearch />
                  {t('search-accounts')}
                </Filter.Item>
                <Filter.Item value="isOutBalance" disabled={true}>
                  <IconToggleRightFilled />
                  {t('off-balance-sheet-account')}
                </Filter.Item>

                <Command.Separator className="my-1" />
                <SelectMember.FilterItem
                  value="createdUserId"
                  label={t('date-type-created')}
                />
                <SelectMember.FilterItem
                  value="modifiedUserId"
                  label={t('modified')}
                />
                <Filter.Item value="updatedDate" inDialog>
                  <IconCalendar />
                  {t('modified')}
                </Filter.Item>
                <Filter.Item value="createdDate" inDialog>
                  <IconCalendar />
                  {t('date-type-created')}
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
          <Filter.View filterKey="statuses">
            <AccountsFilterTrStatus />
          </Filter.View>
          <SelectMember.FilterView mode="single" queryKey="mentionOwnerId" />
          <SelectMember.FilterView mode="single" queryKey="mentionUserId" />

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
  const { t } = useTranslation('accounting');
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
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            {t('number')}
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="date">
          <Filter.BarName>
            <IconCalendar />
            {t('date')}
          </Filter.BarName>
          <Filter.Date filterKey="date" />
        </Filter.BarItem>
        <SelectBranches.FilterBar
          label={t('branch')}
          filterKey="branchId"
          mode="single"
        />
        <SelectDepartments.FilterBar
          label={t('department')}
          filterKey="departmentId"
          mode="single"
        />
        <FilterBarCurrency />
        <FilterBarTrStatus />
        <FilterBarTrJournal />

        <SelectAccount.FilterBar queryKey="accountIds" mode="multiple" />
        <Filter.BarItem queryKey="accountSearchValue">
          <Filter.BarName>
            <IconLabelFilled />
            {t('search-accounts')}
          </Filter.BarName>
          <Filter.BarButton filterKey="accountSearchValue" inDialog>
            {accountSearchValue}
          </Filter.BarButton>
        </Filter.BarItem>

        <SelectMember.FilterBar
          queryKey="mentionOwnerId"
          label={t('performed-by')}
          mode="single"
        />
        <SelectMember.FilterBar
          queryKey="mentionUserId"
          label={t('approver')}
          mode="single"
        />
        <SelectMember.FilterBar
          queryKey="createdUserId"
          label={t('date-type-created')}
          mode="single"
        />
        <SelectMember.FilterBar
          queryKey="modifiedUserId"
          label={t('modified')}
          mode="single"
        />
        <Filter.BarItem queryKey="createdDate">
          <Filter.BarName>
            <IconCalendar />
            {t('created-date')}
          </Filter.BarName>
          <Filter.Date filterKey="createdDate" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updatedDate">
          <Filter.BarName>
            <IconCalendar />
            {t('modified-date')}
          </Filter.BarName>
          <Filter.Date filterKey="updatedDate" />
        </Filter.BarItem>

        <TransactionsFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
