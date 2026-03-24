import {
  IconCoins,
  IconHash,
  IconLabelFilled,
  IconLayoutGridAdd,
  IconNotebook,
  IconSearch,
  IconToggleRightFilled,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useMultiQueryState,
} from 'erxes-ui';
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
  FilterBarStatus
} from './filters/FilterHelpers';

const AccountsFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    searchValue?: string;
    code?: string;
    name?: string;
    categoryId?: string;
    currency?: string
    kind?: string;
    journal?: string;
    status?: string;
    isTemp?: string;
    isOutBalance?: string;
  }>([
    'searchValue', 'code', 'name', 'categoryId', 'currency',
    'kind', 'journal', 'status', 'isTemp', 'isOutBalance'
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
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <Filter.Item value="code" inDialog>
                  <IconHash />
                  Code
                </Filter.Item>
                <Filter.Item value="name" inDialog>
                  <IconLabelFilled />
                  Name
                </Filter.Item>
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
                  Is Out Balance
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
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="code" inDialog>
          <Filter.DialogStringView filterKey="code" />
        </Filter.View>
        <Filter.View filterKey="name" inDialog>
          <Filter.DialogStringView filterKey="name" />
        </Filter.View>
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
        <Filter.BarItem queryKey="code">
          <Filter.BarName>
            <IconHash />
            Code
          </Filter.BarName>
          <Filter.BarButton filterKey="code" inDialog>
            {code}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="name">
          <Filter.BarName>
            <IconLabelFilled />
            Name
          </Filter.BarName>
          <Filter.BarButton filterKey="name" inDialog>
            {name}
          </Filter.BarButton>
        </Filter.BarItem>
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
