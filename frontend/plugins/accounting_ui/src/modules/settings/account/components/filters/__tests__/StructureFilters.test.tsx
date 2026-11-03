import { fireEvent, render, screen } from '@testing-library/react';
import {
  AccountsFilterStructure,
  FilterBarStructure,
} from '@/settings/account/components/filters/FilterHelpers';

let mockParams: Record<string, string> = {};
const mockSetQuery = jest.fn();
const mockResetFilterState = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('erxes-ui', () => ({
  Combobox: { Content: 'div' },
  Popover: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    { Trigger: ({ children }: { children: React.ReactNode }) => children },
  ),
  Filter: {
    BarItem: 'div',
    BarName: 'span',
    BarButton: 'div',
  },
  useFilterContext: () => ({
    sessionKey: 'transactions-cursor',
    resetFilterState: mockResetFilterState,
  }),
  useFilterQueryState: (queryKey: string, sessionKey: string) => [
    mockParams[queryKey] ?? null,
    (value: string | null) => mockSetQuery(queryKey, sessionKey, value),
  ],
}));

jest.mock('ui-modules', () => {
  const mockSelect = (picked: string) =>
    Object.assign(
      ({
        children,
        onValueChange,
      }: {
        children: React.ReactNode;
        onValueChange: (value?: string[] | string) => void;
      }) => (
        <div>
          {children}
          <button onClick={() => onValueChange(picked)}>pick</button>
          <button onClick={() => onValueChange()}>clear</button>
          <button onClick={() => onValueChange([])}>clear all</button>
        </div>
      ),
      { Content: () => null },
    );
  const knownTitles: Record<string, string> = {
    erdenet: 'Erdenet branch',
    finance: 'Finance',
  };
  const mockBadge = ({ id }: { id?: string }) =>
    id && knownTitles[id] ? <span>{knownTitles[id]}</span> : null;

  return {
    SelectBranches: mockSelect('ulaanbaatar'),
    SelectDepartments: mockSelect('finance'),
    BranchBadge: ({ branchId }: { branchId?: string }) =>
      mockBadge({ id: branchId }),
    DepartmentBadge: ({ departmentId }: { departmentId?: string }) =>
      mockBadge({ id: departmentId }),
  };
});

jest.mock('@/settings/hooks/useCurrencyConfigs', () => ({
  getCurrencyCodeFromOptions: jest.fn(),
  useCurrencyConfigs: () => ({}),
}));

jest.mock(
  '@/settings/account/account-categories/components/SelectAccountCategory',
  () => ({ SelectAccountCatCommand: () => null, SelectAccountCategory: {} }),
);

beforeEach(() => {
  mockParams = {};
  jest.clearAllMocks();
});

describe('branch and department filters', () => {
  test.each([
    ['branchId', 'ulaanbaatar'],
    ['departmentId', 'finance'],
  ] as const)(
    'picking a %s filters the list and restarts it from the first page',
    (queryKey, picked) => {
      render(<AccountsFilterStructure queryKey={queryKey} />);

      fireEvent.click(screen.getByText('pick'));

      expect(mockSetQuery).toHaveBeenCalledWith(
        queryKey,
        'transactions-cursor',
        picked,
      );
      expect(mockResetFilterState).toHaveBeenCalled();
    },
  );

  test('clearing the branch removes it from the link instead of writing "undefined"', () => {
    mockParams = { branchId: 'ulaanbaatar' };
    render(<AccountsFilterStructure queryKey="branchId" />);

    fireEvent.click(screen.getByText('clear'));
    fireEvent.click(screen.getByText('clear all'));

    expect(mockSetQuery.mock.calls).toEqual([
      ['branchId', 'transactions-cursor', null],
      ['branchId', 'transactions-cursor', null],
    ]);
  });

  test('a branch from a shared link shows as a named chip that can be changed', () => {
    mockParams = { branchId: 'erdenet' };
    render(<FilterBarStructure queryKey="branchId" />);

    expect(screen.getByText('branch')).toBeTruthy();
    expect(screen.getByText('Erdenet branch')).toBeTruthy();

    fireEvent.click(screen.getByText('pick'));

    expect(mockSetQuery).toHaveBeenCalledWith(
      'branchId',
      'transactions-cursor',
      'ulaanbaatar',
    );
  });

  test('a deleted branch in an old link never shows its raw id in the chip', () => {
    mockParams = { branchId: '64f0c2deletedbranch' };
    render(<FilterBarStructure queryKey="branchId" />);

    expect(screen.getByText('branch')).toBeTruthy();
    expect(screen.queryByText('64f0c2deletedbranch')).toBeNull();
  });

  test('no chip is shown while no department is chosen', () => {
    render(<FilterBarStructure queryKey="departmentId" />);

    expect(screen.queryByText('department')).toBeNull();
  });
});
