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
  CurrencyCode,
  Filter,
  CurrencyField,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { SelectAccountCategory } from '../account-categories/components/SelectAccountCategory';
import { SelectAccountKindCommand } from './AccountsKind';
import { SelectAccountJournalCommand } from './AccountsJournal';

export const AccountsFilterBar = () => {
  const [queries] = useMultiQueryState<{
    code: string;
    name: string;
    categoryId: string;
    currency: string;
    kind: string;
    journal: string;
    due: string;
  }>(['code', 'name', 'categoryId', 'currency', 'kind', 'journal', 'due']);

  const isFiltered = Object.values(queries).some((query) => !!query);

  if (!isFiltered) return null;
  const { code, name } = queries;

  return (
    <Filter.Bar>
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
      <FilterBarDue />
    </Filter.Bar>
  );
};

const FilterBarCategory = () => {
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');

  return (
    <Filter.BarItem queryKey="categoryId">
      <Filter.BarName>
        <IconLayoutGridAdd />
        Category
      </Filter.BarName>
      <SelectAccountCategory
        selected={categoryId ?? undefined}
        onSelect={(categoryId) => setCategoryId(categoryId)}
        recordId="categoryId"
        variant="ghost"
        className="rounded-none h-7 bg-background"
      />
    </Filter.BarItem>
  );
};

const FilterBarCurrency = () => {
  const [currency, setCurrency] = useQueryState<CurrencyCode>('currency');

  return (
    <Filter.BarItem queryKey="currency">
      <Filter.BarName>
        <IconCoins />
        Currency
      </Filter.BarName>
      <CurrencyField.SelectCurrency
        value={currency ?? undefined}
        onChange={(value) => setCurrency(value)}
        variant="ghost"
        className="rounded-none h-7 bg-background"
      />
    </Filter.BarItem>
  );
};

const FilterBarKind = () => {
  const [kind, setKind] = useQueryState<string>('kind');

  return (
    <Filter.BarItem queryKey="kind">
      <Filter.BarName>
        <IconToggleRightFilled />
        Kind
      </Filter.BarName>
      <SelectAccountKindCommand
        selected={kind}
        onSelect={(value) => setKind(value)}
        variant="ghost"
        className="rounded-none h-7 bg-background"
      />
    </Filter.BarItem>
  );
};
const FilterBarJournal = () => {
  const [journal, setJournal] = useQueryState<string>('journal');

  return (
    <Filter.BarItem queryKey="journal">
      <Filter.BarName>
        <IconNotebook />
        Journal
      </Filter.BarName>
      <SelectAccountJournalCommand
        selected={journal}
        onSelect={(value) => setJournal(value)}
        variant="ghost"
        className="rounded-none h-7 bg-background"
      />
    </Filter.BarItem>
  );
};

const FilterBarDue = () => {
  return (
    <Filter.BarItem queryKey="due">
      <Filter.BarName>
        <IconCalendarEventFilled />
        Due date
      </Filter.BarName>
      <Filter.Date filterKey="due" />
    </Filter.BarItem>
  );
};
