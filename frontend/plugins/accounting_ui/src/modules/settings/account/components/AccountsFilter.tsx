import {
  IconCoins,
  IconLayoutGridAdd,
  IconNotebook,
  IconToggleRightFilled,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { AccountsTotalCount } from './AccountsTotalCount';
import {
  AccountsFilterCategory,
  AccountsFilterCurrency,
  AccountsFilterIsOutBalance,
  AccountsFilterIsTemp,
  AccountsFilterJournal,
  AccountsFilterKind,
  AccountsFilterStatus,
  FilterBarCategory,
  FilterBarCurrency,
  FilterBarIsOutBalance,
  FilterBarIsTemp,
  FilterBarJournal,
  FilterBarKind,
  FilterBarStatus,
  FilterBarStringItem,
  FilterPopoverStringItems,
  FilterStringDialogViews,
} from './filters/FilterHelpers';

const AccountsFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    searchValue?: string;
    code?: string;
    name?: string;
    categoryId?: string;
    currency?: string;
    kind?: string;
    journal?: string;
    status?: string;
    isTemp?: string;
    isOutBalance?: string;
  }>([
    'searchValue',
    'code',
    'name',
    'categoryId',
    'currency',
    'kind',
    'journal',
    'status',
    'isTemp',
    'isOutBalance',
  ]);

  const hasFilters = Object.values(queries || {}).some(
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
                placeholder="Шүүх"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <FilterPopoverStringItems
                  filterKeys={['searchValue', 'code', 'name']}
                />
                <Filter.Item value="category">
                  <IconLayoutGridAdd />
                  Category
                </Filter.Item>
                <Filter.Item value="currency">
                  <IconCoins />
                  Currency
                </Filter.Item>
                <Filter.Item value="kind">
                  <IconToggleRightFilled />
                  Kind
                </Filter.Item>
                <Filter.Item value="journal">
                  <IconNotebook />
                  Journal
                </Filter.Item>
                <Filter.Item value="isTemp">
                  <IconToggleRightFilled />
                  Is Temp
                </Filter.Item>
                <Filter.Item value="isOutBalance">
                  <IconToggleRightFilled />
                  Баланс бус
                </Filter.Item>
                <Filter.Item value="status">
                  <IconToggleRightFilled />
                  Status
                </Filter.Item>
                <Command.Separator className="my-1" />
              </Command.List>
            </Command>
          </Filter.View>
          <AccountsFilterCategory />
          <Filter.View filterKey="currency">
            <AccountsFilterCurrency />
          </Filter.View>
          <Filter.View filterKey="kind">
            <AccountsFilterKind />
          </Filter.View>
          <Filter.View filterKey="journal">
            <AccountsFilterJournal />
          </Filter.View>
          <Filter.View filterKey="isTemp">
            <AccountsFilterIsTemp />
          </Filter.View>
          <Filter.View filterKey="isOutBalance">
            <AccountsFilterIsOutBalance />
          </Filter.View>
          <Filter.View filterKey="status">
            <AccountsFilterStatus />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <FilterStringDialogViews filterKeys={['searchValue', 'code', 'name']} />
      </Filter.Dialog>
    </>
  );
};

export const AccountsFilter = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    code: string;
    name: string;
  }>(['code', 'name', 'searchValue']);

  const { code, name, searchValue } = queries;

  return (
    <Filter id="accounts-filter">
      <Filter.Bar>
        <FilterBarStringItem queryKey="searchValue" value={searchValue} />
        <FilterBarStringItem queryKey="code" value={code} />
        <FilterBarStringItem queryKey="name" value={name} />
        <FilterBarCategory />
        <FilterBarCurrency />
        <FilterBarKind />
        <FilterBarJournal />
        <FilterBarIsTemp />
        <FilterBarIsOutBalance />
        <FilterBarStatus />
        <AccountsFilterPopover />
        <AccountsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
