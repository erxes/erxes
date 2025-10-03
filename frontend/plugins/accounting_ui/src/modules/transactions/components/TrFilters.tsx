import {
  IconCalendarEventFilled,
  IconCoins,
  IconHash,
  IconLabelFilled,
  IconLayoutGridAdd,
  IconNotebook,
  IconToggleRightFilled,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  SelectTree,
  useQueryState,
  CurrencyField,
  useFilterContext,
  CurrencyCode,
} from 'erxes-ui';
import { SelectAccountCommand } from '@/settings/account/account-categories/components/SelectAccountCategory';
import { AccountsJournalCommand } from '@/settings/account/components/AccountsJournal';
import { AccountsKindCommand } from '@/settings/account/components/AccountsKind';

export const TransactionsFilter = () => {
  return (
    <>
      <Filter.Popover scope="transactions-filter">
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Command.Input
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />

              <Command.List className="p-1">
                <Filter.Item value="name" inDialog>
                  <IconLabelFilled />
                  Name
                </Filter.Item>
                <Filter.Item value="accountCode" inDialog>
                  <IconHash />
                  Account Code
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
                <Command.Separator className="my-1" />
                <Filter.Item value="due">
                  <IconCalendarEventFilled />
                  Due date
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <AccountsFilterCategory />
          <Filter.View filterKey="due">
            <Filter.DateView filterKey="due" />
          </Filter.View>
          <Filter.View filterKey="created">
            <Filter.DateView filterKey="created" />
          </Filter.View>
          <Filter.View filterKey="updated">
            <Filter.DateView filterKey="updated" />
          </Filter.View>
          <Filter.View filterKey="currency">
            <AccountsFilterCurrency />
          </Filter.View>
          <Filter.View filterKey="kind">
            <AccountsFilterKind />
          </Filter.View>
          <Filter.View filterKey="journal">
            <AccountsFilterJournal />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="name" inDialog>
          <Filter.DialogStringView filterKey="name" />
        </Filter.View>
        <Filter.View filterKey="accountCode" inDialog>
          <Filter.DialogStringView filterKey="accountCode" />
        </Filter.View>
        <Filter.View filterKey="due" inDialog>
          <Filter.DialogDateView filterKey="due" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const AccountsFilterCategory = () => {
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');
  const { resetFilterState } = useFilterContext();

  return (
    <SelectTree.Provider id="account-category-filter" ordered>
      <Filter.View filterKey="category">
        <SelectAccountCommand
          focusOnMount
          selected={categoryId ?? undefined}
          onSelect={(categoryId) => {
            setCategoryId(categoryId);
            resetFilterState();
          }}
        />
      </Filter.View>
    </SelectTree.Provider>
  );
};

export const AccountsFilterCurrency = () => {
  const [currency, setCurrency] = useQueryState<CurrencyCode>('currency');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="currency">
      <CurrencyField.SelectCurrencyCommand
        focusOnMount
        value={currency ?? undefined}
        onSelect={(code) => {
          setCurrency(code);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const AccountsFilterKind = () => {
  const [kind, setKind] = useQueryState<string | null>('kind');
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string | null) => {
    setKind(value);
    resetFilterState();
  };

  return (
    <AccountsKindCommand focusOnMount selected={kind} onSelect={handleSelect} />
  );
};

export const AccountsFilterJournal = () => {
  const [journal, setJournal] = useQueryState<string | null>('journal');
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string | null) => {
    setJournal(value);
    resetFilterState();
  };

  return (
    <AccountsJournalCommand
      focusOnMount
      selected={journal}
      onSelect={handleSelect}
    />
  );
};
