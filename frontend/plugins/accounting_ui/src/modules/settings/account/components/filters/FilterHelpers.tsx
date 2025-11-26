import { IconCoins, IconLayoutGridAdd, IconNotebook, IconToggleRightFilled } from "@tabler/icons-react";
import { CurrencyCode, CurrencyField, Filter, SelectTree, useFilterContext, useQueryState } from "erxes-ui";
import { SelectAccountCatCommand, SelectAccountCategory } from "../../account-categories/components/SelectAccountCategory";
import { AccountsIsOutBalanceCommand, SelectAccountIsOutBalanceCommand } from "./AccountsIsOutBalance";
import { AccountsIsTempCommand, SelectAccountIsTempCommand } from "./AccountsIsTemp";
import { AccountsJournalCommand, SelectAccountJournalCommand } from "./AccountsJournal";
import { AccountsKindCommand, SelectAccountKindCommand } from "./AccountsKind";
import { AccountsStatusCommand, SelectAccountStatusCommand } from "./AccountsStatus";

// category helper
export const AccountsFilterCategory = () => {
  const [categoryId, setCategoryId] = useQueryState<string | null>('categoryId');
  const { resetFilterState } = useFilterContext();

  return (
    <SelectTree.Provider id="account-category-filter" ordered>
      <Filter.View filterKey="category">
        <SelectAccountCatCommand
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

export const FilterBarCategory = () => {
  const [categoryId, setCategoryId] = useQueryState<string | null>('categoryId');

  return (
    <Filter.BarItem queryKey="categoryId">
      <Filter.BarName>
        <IconLayoutGridAdd />
        Category
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountCategory
          selected={categoryId ?? undefined}
          onSelect={(categoryId) => setCategoryId(categoryId)}
          recordId="categoryId"
          variant="ghost"
          className="rounded-none bg-background max-h-full p-0"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// currency filter helper
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

export const FilterBarCurrency = () => {
  const [currency, setCurrency] = useQueryState<CurrencyCode>('currency');

  return (
    <Filter.BarItem queryKey="currency">
      <Filter.BarName>
        <IconCoins />
        Currency
      </Filter.BarName>
      <Filter.BarButton>
        <CurrencyField.SelectCurrency
          value={currency ?? undefined}
          onChange={(value) => setCurrency(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// account kind filter helper
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

export const FilterBarKind = () => {
  const [kind, setKind] = useQueryState<string | null>('kind');

  return (
    <Filter.BarItem queryKey="kind">
      <Filter.BarName>
        <IconToggleRightFilled />
        Kind
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountKindCommand
          selected={kind}
          onSelect={(value) => setKind(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// account journal filter helper
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

export const FilterBarJournal = () => {
  const [journal, setJournal] = useQueryState<string | null>('journal');

  return (
    <Filter.BarItem queryKey="journal">
      <Filter.BarName>
        <IconNotebook />
        Journal
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountJournalCommand
          selected={journal}
          onSelect={(value) => setJournal(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// account isTemp filter helper
export const AccountsFilterIsTemp = () => {
  const [isTemp, setIsTemp] = useQueryState<string | null>('isTemp');
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string | null) => {
    setIsTemp(value);
    resetFilterState();
  };

  return (
    <AccountsIsTempCommand focusOnMount selected={isTemp} onSelect={handleSelect} />
  );
};

export const FilterBarIsTemp = () => {
  const [isTemp, setIsTemp] = useQueryState<string | null>('isTemp');

  return (
    <Filter.BarItem queryKey="isTemp">
      <Filter.BarName>
        <IconToggleRightFilled />
        IsTemp
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountIsTempCommand
          selected={isTemp}
          onSelect={(value) => setIsTemp(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// account isOutBalance filter helper
export const AccountsFilterIsOutBalance = () => {
  const [isOutBalance, setIsOutBalance] = useQueryState<string | null>('isOutBalance');
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string | null) => {
    setIsOutBalance(value);
    resetFilterState();
  };

  return (
    <AccountsIsOutBalanceCommand focusOnMount selected={isOutBalance} onSelect={handleSelect} />
  );
};

export const FilterBarIsOutBalance = () => {
  const [isOutBalance, setIsOutBalance] = useQueryState<string | null>('isOutBalance');

  return (
    <Filter.BarItem queryKey="isOutBalance">
      <Filter.BarName>
        <IconToggleRightFilled />
        Is Out Balance
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountIsOutBalanceCommand
          selected={isOutBalance}
          onSelect={(value) => setIsOutBalance(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// account status filter helper
export const AccountsFilterStatus = () => {
  const [status, setStatus] = useQueryState<string | null>('status');
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string | null) => {
    setStatus(value);
    resetFilterState();
  };

  return (
    <AccountsStatusCommand focusOnMount selected={status} onSelect={handleSelect} />
  );
};

export const FilterBarStatus = () => {
  const [status, setStatus] = useQueryState<string | null>('status');

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconToggleRightFilled />
        Is Out Balance
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountStatusCommand
          selected={status}
          onSelect={(value) => setStatus(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};
