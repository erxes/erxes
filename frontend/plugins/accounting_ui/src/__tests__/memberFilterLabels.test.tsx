import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { SafeRemainderFilter } from '@/inventories/safeRemainders/components/SafeRemainderFilters';

const readAccountingLocale = (locale: string): Record<string, string> =>
  JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        '../../../../../backend/gateway/src/locales',
        locale,
        'accounting.json',
      ),
      'utf8',
    ),
  );

const mockLocales = {
  en: readAccountingLocale('en'),
  mn: readAccountingLocale('mn'),
};
let mockLanguage: keyof typeof mockLocales = 'en';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => mockLocales[mockLanguage][key] ?? key,
  }),
}));

jest.mock('erxes-ui', () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const nothing = () => null;

  return {
    Combobox: { Content: Passthrough },
    Command: Object.assign(Passthrough, {
      List: Passthrough,
      Separator: nothing,
    }),
    Filter: Object.assign(Passthrough, {
      Bar: Passthrough,
      BarButton: nothing,
      BarItem: ({
        children,
        queryKey,
      }: {
        children?: React.ReactNode;
        queryKey: string;
      }) => <div data-testid={`chip-${queryKey}`}>{children}</div>,
      BarName: Passthrough,
      CommandInput: nothing,
      Date: nothing,
      DateView: nothing,
      Dialog: nothing,
      DialogDateView: nothing,
      DialogStringView: nothing,
      Item: ({
        children,
        value,
      }: {
        children?: React.ReactNode;
        value: string;
      }) => (
        <div role="option" aria-label={value}>
          {children}
        </div>
      ),
      Popover: Passthrough,
      Trigger: nothing,
      View: Passthrough,
    }),
    useMultiQueryState: () => [{}],
  };
});

jest.mock('ui-modules', () => {
  const nothing = () => null;
  const FilterItem = ({ label, value }: { label: string; value: string }) => (
    <div role="option" aria-label={value}>
      {label}
    </div>
  );
  const FilterBar = ({
    filterKey,
    label,
    queryKey,
  }: {
    filterKey?: string;
    label: string;
    queryKey?: string;
  }) => <div data-testid={`chip-${queryKey ?? filterKey}`}>{label}</div>;
  const select = { FilterBar, FilterItem, FilterView: nothing };

  return {
    SelectBranches: select,
    SelectDepartments: select,
    SelectMember: select,
  };
});

jest.mock('~/modules/settings/account/components/SelectAccount', () => ({
  SelectAccount: {
    FilterBar: () => null,
    FilterItem: () => null,
    FilterView: () => null,
  },
}));

jest.mock('@/settings/account/components/filters/FilterHelpers', () => ({
  AccountsFilterCategory: () => null,
  AccountsFilterCurrency: () => null,
  AccountsFilterIsOutBalance: () => null,
  AccountsFilterKind: () => null,
  AccountsFilterStatus: () => null,
  AccountsFilterTrJournal: () => null,
  AccountsFilterTrStatus: () => null,
  FilterBarCategory: () => null,
  FilterBarCurrency: () => null,
  FilterBarIsOutBalance: () => null,
  FilterBarKind: () => null,
  FilterBarStatus: () => null,
  FilterBarTrJournal: () => null,
  FilterBarTrStatus: () => null,
  AccountsFilterStructure: () => null,
  FilterBarStructure: () => null,
}));

jest.mock('@/transactions/hooks/useTransactionVars', () => ({
  useTransactionsQueryParams: () => ({}),
}));

jest.mock('@/inventories/safeRemainders/hooks/useSafeRemainders', () => ({
  useSafeRemainderQueryParams: () => ({}),
}));

const menuLabels = () =>
  screen.getAllByRole('option').map((option) => option.textContent);

const optionText = (value: string) =>
  screen.getByRole('option', { name: value }).textContent;

const chipText = (queryKey: string) =>
  screen.getByTestId(`chip-${queryKey}`).textContent;

describe.each([
  ['en', 'Created by', 'Modified by'],
  ['mn', 'Үүсгэсэн хэрэглэгч', 'Зассан хэрэглэгч'],
] as const)(
  'member filters read as people in %s',
  (language, createdBy, modifiedBy) => {
    beforeEach(() => {
      mockLanguage = language;
    });

    it('lets an accountant tell who created a receipt from when it was created', () => {
      render(<TransactionsFilter />);

      expect(optionText('createdUserId')).toBe(createdBy);
      expect(optionText('modifiedUserId')).toBe(modifiedBy);
      expect(optionText('createdDate')).not.toBe(createdBy);
      expect(optionText('updatedDate')).not.toBe(modifiedBy);
    });

    it('never offers two transaction filters under the same name', () => {
      render(<TransactionsFilter />);

      const labels = menuLabels();
      expect(new Set(labels).size).toBe(labels.length);
    });

    it('keeps the labels distinct next to the branch, department and journal filters of the receipts page', () => {
      render(<TransactionsFilter />);

      const labels = menuLabels();
      expect(new Set(labels).size).toBe(labels.length);
      expect(optionText('createdUserId')).toBe(createdBy);
      expect(optionText('branchId')).not.toBe(createdBy);
      expect(optionText('departmentId')).not.toBe(createdBy);
      expect(optionText('journal')).not.toBe(modifiedBy);
    });

    it('names an applied filter chip after the same person label as the menu', () => {
      render(<TransactionsFilter />);

      expect(chipText('createdUserId')).toBe(createdBy);
      expect(chipText('modifiedUserId')).toBe(modifiedBy);
    });

    it('shows a date chip with the same words as its menu option', () => {
      render(<TransactionsFilter />);

      expect(chipText('createdDate')).toBe(optionText('createdDate'));
      expect(chipText('updatedDate')).toBe(optionText('updatedDate'));
    });

    it('does not label the inventory count creator as a date', () => {
      render(<SafeRemainderFilter />);

      expect(optionText('createdUserId')).toBe(createdBy);
      expect(optionText('modifiedUserId')).toBe(modifiedBy);
      expect(chipText('createdUserId')).toBe(createdBy);
      expect(chipText('modifiedUserId')).toBe(modifiedBy);

      const labels = menuLabels();
      expect(new Set(labels).size).toBe(labels.length);
    });
  },
);
