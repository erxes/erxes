import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { useAccountingPosList } from '../AccountingCheckSyncedOrderSelects';
import {
  AccountingCheckSyncedOrderRuleFilterBar,
  AccountingCheckSyncedOrderRuleFilterView,
} from '../AccountingCheckSyncedOrderRuleSelect';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@apollo/client', () => ({ useQuery: jest.fn() }));
jest.mock('../../graphql/checkSyncedOrders', () => ({
  ACCOUNTING_SYNC_ORDER_RULES_QUERY: {},
}));
jest.mock('../AccountingCheckSyncedOrderSelects', () => ({
  useAccountingPosList: jest.fn(),
}));
jest.mock('erxes-ui', () => {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    useMultiQueryState: jest.fn(),
    useFilterContext: () => ({ resetFilterState: jest.fn() }),
    Popover: Object.assign(Wrapper, { Trigger: Wrapper }),
    Combobox: { Content: Wrapper, Check: () => null },
    Filter: {
      View: Wrapper,
      Item: Wrapper,
      BarItem: Wrapper,
      BarName: Wrapper,
      BarButton: ({ children }: { children?: ReactNode }) => (
        <span data-testid="bar-button">{children}</span>
      ),
    },
    Command: Object.assign(Wrapper, {
      Input: () => null,
      Empty: () => null,
      List: Wrapper,
      Item: ({
        children,
        keywords,
        onSelect,
      }: {
        children?: ReactNode;
        keywords?: string[];
        onSelect: () => void;
      }) => (
        <button data-keywords={keywords?.join('|')} onClick={onSelect}>
          {children}
        </button>
      ),
    }),
  };
});

const rules = [
  {
    _id: 'rule-titled',
    code: 'syncOrder',
    subId: 'pos-main',
    value: { title: 'Main store sales', returnType: 'onlySale' },
  },
  {
    _id: 'nxMSFdLJnOx26KA0drt3q',
    code: 'syncOrder',
    subId: 'pos-belty',
    value: { returnType: 'onlySale' },
  },
  {
    _id: '4q5YjQ5HJWUeF-OgC8p8P',
    code: 'syncOrder',
    subId: 'pos-deleted',
    value: { returnType: 'fullTr' },
  },
];

const setQueries = jest.fn();

const mockState = (orderRuleId: string | null) =>
  jest
    .mocked(useMultiQueryState)
    .mockReturnValue([{ orderRuleId, pos: null }, setQueries]);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQuery).mockReturnValue({
    loading: false,
    data: { accountingsConfigs: rules },
  } as unknown as ReturnType<typeof useQuery>);
  jest.mocked(useAccountingPosList).mockReturnValue({
    data: { posList: [{ _id: 'pos-belty', name: 'Belty 1' }] },
  } as unknown as ReturnType<typeof useAccountingPosList>);
  mockState(null);
});

test('rules without a title are named after their POS, and unknown ones never fall back to the raw id', () => {
  render(<AccountingCheckSyncedOrderRuleFilterView />);

  expect(screen.getByText('Main store sales')).toBeTruthy();
  expect(screen.getByText('Belty 1')).toBeTruthy();
  expect(screen.getByText('untitled-rule')).toBeTruthy();
  expect(screen.queryByText('nxMSFdLJnOx26KA0drt3q')).toBeNull();
  expect(screen.queryByText('4q5YjQ5HJWUeF-OgC8p8P')).toBeNull();
  expect(screen.queryByText(/pos-/)).toBeNull();
});

test('rules are searchable by the name the user sees, and picking one filters by its POS', () => {
  render(<AccountingCheckSyncedOrderRuleFilterView />);
  const belty = screen.getByText('Belty 1').closest('button');

  expect(belty?.getAttribute('data-keywords')).toContain('Belty 1');

  fireEvent.click(belty as HTMLElement);

  expect(setQueries).toHaveBeenCalledWith({
    orderRuleId: 'nxMSFdLJnOx26KA0drt3q',
    pos: 'pos-belty',
  });
});

test('the filter chip shows the selected rule name, or a prompt when nothing is selected', () => {
  mockState('nxMSFdLJnOx26KA0drt3q');
  const { unmount } = render(<AccountingCheckSyncedOrderRuleFilterBar />);
  expect(screen.getByTestId('bar-button').textContent).toBe('Belty 1');
  unmount();

  mockState(null);
  render(<AccountingCheckSyncedOrderRuleFilterBar />);
  expect(screen.getByTestId('bar-button').textContent).toBe('Select rule');
});
