import { render, screen } from '@testing-library/react';
import { TransactionsFilter } from '@/transactions/components/TrFilters';

let mockParams: Record<string, string> = {};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@tabler/icons-react', () => ({
  IconCalendar: () => null,
  IconCoins: () => null,
  IconHash: () => null,
  IconLabelFilled: () => null,
  IconLayoutGridAdd: () => null,
  IconNotebook: () => null,
  IconNumber: () => null,
  IconSearch: () => null,
  IconToggleRightFilled: () => null,
}));

jest.mock('ui-modules', () => {
  const mockSelect = (name: string) => ({
    FilterItem: ({ label }: { label: string }) => (
      <button>{`menu:${label}`}</button>
    ),
    FilterView: () => null,
    FilterBar: ({
      filterKey,
      queryKey,
    }: {
      filterKey?: string;
      queryKey?: string;
    }) =>
      mockParams[filterKey ?? queryKey ?? ''] ? (
        <span>{`chip:${name}:${mockParams[filterKey ?? queryKey ?? '']}`}</span>
      ) : null,
  });

  return {
    SelectBranches: mockSelect('branch'),
    SelectDepartments: mockSelect('department'),
    SelectMember: mockSelect('member'),
  };
});

jest.mock('~/modules/settings/account/components/SelectAccount', () => ({
  SelectAccount: {
    FilterItem: () => null,
    FilterView: () => null,
    FilterBar: () => null,
  },
}));

jest.mock('@/settings/account/components/filters/FilterHelpers', () => {
  const nothing = (): null => null;
  const filters = [
    'Category',
    'Currency',
    'IsOutBalance',
    'Kind',
    'Status',
    'TrJournal',
    'TrStatus',
  ];

  return {
    ...Object.fromEntries(
      filters.flatMap((name) => [
        [`AccountsFilter${name}`, nothing],
        [`FilterBar${name}`, nothing],
      ]),
    ),
    FilterBarTrJournal: () =>
      mockParams.journal ? <span>chip:journal</span> : null,
    AccountsFilterStructure: nothing,
    FilterBarStructure: ({ queryKey }: { queryKey: string }) =>
      mockParams[queryKey] ? (
        <span>{`chip:${queryKey}:${mockParams[queryKey]}`}</span>
      ) : null,
  };
});

jest.mock('erxes-ui', () => ({
  parseDateRangeFromString: jest.fn(),
  useRecordTableCursor: () => ({ cursor: '' }),
  useMultiQueryState: (keys: string[]) => [
    Object.fromEntries(keys.map((key) => [key, mockParams[key] ?? null])),
    jest.fn(),
  ],
  Combobox: { Content: 'div' },
  Command: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    { List: 'div', Separator: 'hr' },
  ),
  Filter: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Bar: 'div',
      Popover: 'div',
      View: 'div',
      Dialog: 'div',
      BarName: 'span',
      BarButton: 'button',
      BarItem: () => null,
      Date: () => null,
      DateView: () => null,
      DialogDateView: () => null,
      DialogStringView: () => null,
      CommandInput: () => null,
      Trigger: ({ isFiltered }: { isFiltered: boolean }) => (
        <button>{isFiltered ? 'filter active' : 'filter idle'}</button>
      ),
      Item: ({
        children,
        value,
      }: {
        children: React.ReactNode;
        value: string;
      }) => <button>{value === 'journal' ? 'menu:journal' : children}</button>,
    },
  ),
}));

describe('transactions filter', () => {
  beforeEach(() => {
    mockParams = {};
  });

  test('offers branch, department and journal in the filter menu with the other filters', () => {
    render(<TransactionsFilter />);

    expect(screen.getByText('menu:branch')).toBeTruthy();
    expect(screen.getByText('menu:department')).toBeTruthy();
    expect(screen.getByText('menu:journal')).toBeTruthy();
    expect(screen.getByText('search')).toBeTruthy();
  });

  test('a link filtered by branch, department and journal shows each one as an active chip', () => {
    mockParams = {
      branchId: 'ulaanbaatar',
      departmentId: 'finance',
      journal: 'bank',
    };

    render(<TransactionsFilter />);

    expect(screen.getByText('chip:branchId:ulaanbaatar')).toBeTruthy();
    expect(screen.getByText('chip:departmentId:finance')).toBeTruthy();
    expect(screen.getByText('chip:journal')).toBeTruthy();
    expect(screen.getByText('filter active')).toBeTruthy();
  });

  test.each(['branchId', 'departmentId', 'journal'])(
    'marks the filter active when only %s is selected',
    (key) => {
      mockParams = { [key]: 'selected' };

      render(<TransactionsFilter />);

      expect(screen.getByText('filter active')).toBeTruthy();
    },
  );

  test('nothing selected shows no chips and leaves the filter idle', () => {
    render(<TransactionsFilter />);

    expect(screen.queryByText(/^chip:/)).toBeNull();
    expect(screen.getByText('filter idle')).toBeTruthy();
  });

  test('a param the filter does not know about leaves it idle', () => {
    mockParams = { tab: 'history' };

    render(<TransactionsFilter />);

    expect(screen.getByText('filter idle')).toBeTruthy();
  });
});
