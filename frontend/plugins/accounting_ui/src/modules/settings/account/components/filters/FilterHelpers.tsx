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
  CurrencyCode,
  CurrencyField,
  Filter,
  SelectTree,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  SelectAccountCatCommand,
  SelectAccountCategory,
} from '../../account-categories/components/SelectAccountCategory';
import {
  AccountsIsOutBalanceCommand,
  SelectAccountIsOutBalanceCommand,
} from './AccountsIsOutBalance';
import {
  AccountsIsTempCommand,
  SelectAccountIsTempCommand,
} from './AccountsIsTemp';
import {
  AccountsJournalCommand,
  SelectAccountJournalCommand,
} from './AccountsJournal';
import { AccountsKindCommand, SelectAccountKindCommand } from './AccountsKind';
import {
  AccountsStatusCommand,
  SelectAccountStatusCommand,
} from './AccountsStatus';
import {
  AccountsTrJournalCommand,
  SelectAccountTrJournalCommand,
} from './AccountsTrJournal';
import {
  AccountsTrStatusCommand,
  SelectAccountTrStatusCommand,
} from './AccountsTrStatus';

// category helper
export const AccountsFilterCategory = () => {
  const [categoryId, setCategoryId] = useQueryState<string | null>(
    'categoryId',
  );
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
  const { t } = useTranslation('accounting');
  const [categoryId, setCategoryId] = useQueryState<string | null>(
    'categoryId',
  );

  return (
    <Filter.BarItem queryKey="categoryId">
      <Filter.BarName>
        <IconLayoutGridAdd />
        {t('category')}
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
  const { t } = useTranslation('accounting');
  const [currency, setCurrency] = useQueryState<CurrencyCode>('currency');

  return (
    <Filter.BarItem queryKey="currency">
      <Filter.BarName>
        <IconCoins />
        {t('currency')}
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
  const { t } = useTranslation('accounting');
  const [kind, setKind] = useQueryState<string | null>('kind');

  return (
    <Filter.BarItem queryKey="kind">
      <Filter.BarName>
        <IconToggleRightFilled />
        {t('kind')}
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
  const { t } = useTranslation('accounting');
  const [journal, setJournal] = useQueryState<string | null>('journal');

  return (
    <Filter.BarItem queryKey="journal">
      <Filter.BarName>
        <IconNotebook />
        {t('journal')}
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
    <AccountsIsTempCommand
      focusOnMount
      selected={isTemp}
      onSelect={handleSelect}
    />
  );
};

export const FilterBarIsTemp = () => {
  const { t } = useTranslation('accounting');
  const [isTemp, setIsTemp] = useQueryState<string | null>('isTemp');

  return (
    <Filter.BarItem queryKey="isTemp">
      <Filter.BarName>
        <IconToggleRightFilled />
        {t('is-temp')}
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
  const [isOutBalance, setIsOutBalance] = useQueryState<string | null>(
    'isOutBalance',
  );
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string | null) => {
    setIsOutBalance(value);
    resetFilterState();
  };

  return (
    <AccountsIsOutBalanceCommand
      focusOnMount
      selected={isOutBalance}
      onSelect={handleSelect}
    />
  );
};

export const FilterBarIsOutBalance = () => {
  const [isOutBalance, setIsOutBalance] = useQueryState<string | null>(
    'isOutBalance',
  );

  return (
    <Filter.BarItem queryKey="isOutBalance">
      <Filter.BarName>
        <IconToggleRightFilled />
        Баланс бус
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
    <AccountsStatusCommand
      focusOnMount
      selected={status}
      onSelect={handleSelect}
    />
  );
};

export const FilterBarStatus = () => {
  const [status, setStatus] = useQueryState<string | null>('status');

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconToggleRightFilled />
        Төлөв
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

// account journal filter helper
export const AccountsFilterTrJournal = () => {
  const [journal, setJournal] = useQueryState<string | null>('journal');
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string | null) => {
    setJournal(value);
    resetFilterState();
  };

  return (
    <AccountsTrJournalCommand
      focusOnMount
      selected={journal}
      onSelect={handleSelect}
    />
  );
};

export const FilterBarTrJournal = () => {
  const { t } = useTranslation('accounting');
  const [journal, setJournal] = useQueryState<string | null>('journal');

  return (
    <Filter.BarItem queryKey="journal">
      <Filter.BarName>
        <IconNotebook />
        {t('tr-journal')}
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountTrJournalCommand
          selected={journal}
          onSelect={(value) => setJournal(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// tr status filter helper
export const AccountsFilterTrStatus = () => {
  const [statuses, setStatuses] = useQueryState<string[] | null>('statuses');

  const handleSelect = (value: string[] | null) => {
    setStatuses(value);
  };

  return (
    <AccountsTrStatusCommand
      focusOnMount
      selected={statuses}
      onSelect={handleSelect}
    />
  );
};

export const FilterBarTrStatus = () => {
  const { t } = useTranslation('accounting');
  const [statuses, setStatuses] = useQueryState<string[] | null>('statuses');

  return (
    <Filter.BarItem queryKey="statuses">
      <Filter.BarName>
        <IconNotebook />
        {t('tr-status')}
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountTrStatusCommand
          selected={statuses}
          onSelect={(value) => setStatuses(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

const FILTER_BAR_STRING_ICONS = {
  searchValue: IconSearch,
  code: IconHash,
  name: IconLabelFilled,
} as const;

const FILTER_BAR_STRING_LABEL_KEYS = {
  searchValue: 'search',
  code: 'code',
  name: 'name',
} as const;

type FilterBarStringKey = keyof typeof FILTER_BAR_STRING_ICONS;

export const FilterBarStringItem = ({
  queryKey,
  value,
}: {
  queryKey: FilterBarStringKey;
  value?: string | null;
}) => {
  const { t } = useTranslation('accounting');
  const Icon = FILTER_BAR_STRING_ICONS[queryKey];
  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <Icon />
        {t(FILTER_BAR_STRING_LABEL_KEYS[queryKey])}
      </Filter.BarName>
      <Filter.BarButton filterKey={queryKey} inDialog>
        {value}
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

export const FilterStringDialogViews = ({
  filterKeys,
}: {
  filterKeys: FilterBarStringKey[];
}) => (
  <>
    {filterKeys.map((filterKey) => (
      <Filter.View key={filterKey} filterKey={filterKey} inDialog>
        <Filter.DialogStringView filterKey={filterKey} />
      </Filter.View>
    ))}
  </>
);

export const FilterPopoverStringItems = ({
  filterKeys,
}: {
  filterKeys: FilterBarStringKey[];
}) => {
  const { t } = useTranslation('accounting');
  return (
    <>
      {filterKeys.map((filterKey) => {
        const Icon = FILTER_BAR_STRING_ICONS[filterKey];
        return (
          <Filter.Item key={filterKey} value={filterKey} inDialog>
            <Icon />
            {t(FILTER_BAR_STRING_LABEL_KEYS[filterKey])}
          </Filter.Item>
        );
      })}
    </>
  );
};
