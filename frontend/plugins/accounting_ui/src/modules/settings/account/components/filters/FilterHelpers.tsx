import {
  IconCoins,
  IconFolder,
  IconGitBranch,
  IconHash,
  IconLabelFilled,
  IconLayoutGridAdd,
  IconNotebook,
  IconSearch,
  IconToggleRightFilled,
} from '@tabler/icons-react';
import {
  Combobox,
  CurrencyCode,
  CurrencyField,
  Filter,
  Popover,
  SelectTree,
  useFilterContext,
  useFilterQueryState,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BranchBadge,
  DepartmentBadge,
  SelectBranches,
  SelectDepartments,
} from 'ui-modules';
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
  getCurrencyCodeFromOptions,
  useCurrencyConfigs,
} from '../../../hooks/useCurrencyConfigs';
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
  TrStatusOptions,
} from './AccountsTrStatus';

type AccountFilterProps = { queryKey?: string };
type AccountFilterBarProps = AccountFilterProps & { labelKey?: string };

const useAccountFilterQuery = <T,>(queryKey: string) => {
  const { sessionKey } = useFilterContext();
  return useFilterQueryState<T>(queryKey, sessionKey);
};

// category helper
export const AccountsFilterCategory = ({
  filterKey = 'category',
  queryKey = 'categoryId',
}: AccountFilterProps & { filterKey?: string }) => {
  const [categoryId, setCategoryId] = useAccountFilterQuery<string | null>(
    queryKey,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <SelectTree.Provider id="account-category-filter" ordered>
      <Filter.View filterKey={filterKey}>
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

export const FilterBarCategory = ({
  queryKey = 'categoryId',
  labelKey = 'category',
}: AccountFilterBarProps) => {
  const { t } = useTranslation('accounting');
  const [categoryId, setCategoryId] = useAccountFilterQuery<string | null>(
    queryKey,
  );

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconLayoutGridAdd />
        {t(labelKey)}
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountCategory
          selected={categoryId ?? undefined}
          onSelect={(categoryId) => setCategoryId(categoryId)}
          recordId={queryKey}
          variant="ghost"
          className="rounded-none bg-background max-h-full p-0"
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// currency filter helper
export const AccountsFilterCurrency = () => {
  const [currency, setCurrency] =
    useAccountFilterQuery<CurrencyCode>('currency');
  const { resetFilterState } = useFilterContext();
  const { dealCurrencyOptions } = useCurrencyConfigs();

  return (
    <Filter.View filterKey="currency">
      <CurrencyField.SelectCurrencyCommand
        focusOnMount
        value={getCurrencyCodeFromOptions(
          currency ?? undefined,
          dealCurrencyOptions,
        )}
        currencies={dealCurrencyOptions}
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
  const [currency, setCurrency] =
    useAccountFilterQuery<CurrencyCode>('currency');
  const { dealCurrencyOptions } = useCurrencyConfigs();

  return (
    <Filter.BarItem queryKey="currency">
      <Filter.BarName>
        <IconCoins />
        {t('currency')}
      </Filter.BarName>
      <Filter.BarButton>
        <CurrencyField.SelectCurrency
          value={getCurrencyCodeFromOptions(
            currency ?? undefined,
            dealCurrencyOptions,
          )}
          onChange={(value) => setCurrency(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
          currencies={dealCurrencyOptions}
        />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

// account kind filter helper
export const AccountsFilterKind = ({
  queryKey = 'kind',
}: AccountFilterProps) => {
  const [kind, setKind] = useAccountFilterQuery<string | null>(queryKey);
  const { resetFilterState } = useFilterContext();

  const handleSelect = (value: string | null) => {
    setKind(value);
    resetFilterState();
  };

  return (
    <AccountsKindCommand focusOnMount selected={kind} onSelect={handleSelect} />
  );
};

export const FilterBarKind = ({
  queryKey = 'kind',
  labelKey = 'kind',
}: AccountFilterBarProps) => {
  const { t } = useTranslation('accounting');
  const [kind, setKind] = useAccountFilterQuery<string | null>(queryKey);

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconToggleRightFilled />
        {t(labelKey)}
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
export const AccountsFilterIsOutBalance = ({
  queryKey = 'isOutBalance',
}: AccountFilterProps) => {
  const [isOutBalance, setIsOutBalance] = useAccountFilterQuery<string | null>(
    queryKey,
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

export const FilterBarIsOutBalance = ({
  queryKey = 'isOutBalance',
  labelKey = 'off-balance-sheet',
}: AccountFilterBarProps) => {
  const { t } = useTranslation('accounting');
  const [isOutBalance, setIsOutBalance] = useAccountFilterQuery<string | null>(
    queryKey,
  );

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconToggleRightFilled />
        {t(labelKey)}
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
export const AccountsFilterStatus = ({
  queryKey = 'status',
}: AccountFilterProps) => {
  const [status, setStatus] = useAccountFilterQuery<string | null>(queryKey);
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

export const FilterBarStatus = ({
  queryKey = 'status',
  labelKey = 'status',
}: AccountFilterBarProps) => {
  const { t } = useTranslation('accounting');
  const [status, setStatus] = useAccountFilterQuery<string | null>(queryKey);

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconToggleRightFilled />
        {t(labelKey)}
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
  const [journal, setJournal] = useAccountFilterQuery<string | null>('journal');
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
  const [journal, setJournal] = useAccountFilterQuery<string | null>('journal');

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

const MISSING_STRUCTURE_FALLBACK = "empty:before:content-['-']";

const BranchFilterValue = ({ id }: { id: string }) => (
  <span className={MISSING_STRUCTURE_FALLBACK}>
    <BranchBadge branchId={id} renderAsPlainText />
  </span>
);

const DepartmentFilterValue = ({ id }: { id: string }) => (
  <span className={MISSING_STRUCTURE_FALLBACK}>
    <DepartmentBadge departmentId={id} renderAsPlainText />
  </span>
);

const STRUCTURE_FILTERS = {
  branchId: {
    Select: SelectBranches,
    Value: BranchFilterValue,
    Icon: IconGitBranch,
    labelKey: 'branch',
  },
  departmentId: {
    Select: SelectDepartments,
    Value: DepartmentFilterValue,
    Icon: IconFolder,
    labelKey: 'department',
  },
};

type StructureQueryKey = keyof typeof STRUCTURE_FILTERS;

type StructureFilterProps = { queryKey: StructureQueryKey };

const useStructureFilterQuery = (queryKey: StructureQueryKey) => {
  const [value, setValue] = useAccountFilterQuery<string | null>(queryKey);

  const setStructure = (next?: string[] | string) =>
    setValue(typeof next === 'string' && next ? next : null);

  return [value, setStructure] as const;
};

export const AccountsFilterStructure = ({ queryKey }: StructureFilterProps) => {
  const { Select } = STRUCTURE_FILTERS[queryKey];
  const [value, setValue] = useStructureFilterQuery(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Select
      mode="single"
      value={value ?? undefined}
      onValueChange={(next) => {
        setValue(next);
        resetFilterState();
      }}
    >
      <Select.Content />
    </Select>
  );
};

const FilterBarStructurePopover = ({
  queryKey,
  value,
}: StructureFilterProps & { value: string }) => {
  const { Select, Value } = STRUCTURE_FILTERS[queryKey];

  return (
    <>
      <Popover.Trigger asChild>
        <Filter.BarButton filterKey={queryKey}>
          <Value id={value} />
        </Filter.BarButton>
      </Popover.Trigger>
      <Combobox.Content>
        <Select.Content />
      </Combobox.Content>
    </>
  );
};

export const FilterBarStructure = ({ queryKey }: StructureFilterProps) => {
  const { t } = useTranslation('accounting');
  const { Select, Icon, labelKey } = STRUCTURE_FILTERS[queryKey];
  const [value, setValue] = useStructureFilterQuery(queryKey);
  const [open, setOpen] = useState(false);

  if (!value) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <Icon />
        {t(labelKey)}
      </Filter.BarName>
      <Select
        mode="single"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <FilterBarStructurePopover queryKey={queryKey} value={value} />
        </Popover>
      </Select>
    </Filter.BarItem>
  );
};

// tr status filter helper
export const AccountsFilterTrStatus = (options: TrStatusOptions) => {
  const [statuses, setStatuses] = useAccountFilterQuery<string[] | null>(
    'statuses',
  );

  const handleSelect = (value: string[] | null) => {
    setStatuses(value);
  };

  return (
    <AccountsTrStatusCommand
      focusOnMount
      selected={statuses}
      onSelect={handleSelect}
      {...options}
    />
  );
};

export const FilterBarTrStatus = ({
  labelKey = 'tr-status',
  ...options
}: TrStatusOptions & { labelKey?: string }) => {
  const { t } = useTranslation('accounting');
  const [statuses, setStatuses] = useAccountFilterQuery<string[] | null>(
    'statuses',
  );

  return (
    <Filter.BarItem queryKey="statuses">
      <Filter.BarName>
        <IconNotebook />
        {t(labelKey)}
      </Filter.BarName>
      <Filter.BarButton>
        <SelectAccountTrStatusCommand
          selected={statuses}
          onSelect={(value) => setStatuses(value)}
          variant="ghost"
          className="rounded-none h-7 bg-background"
          {...options}
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
