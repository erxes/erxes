import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdjustClosingDetail } from '@/adjustments/closing/components/AdjustClosingDetail';

const mockEnglishLabels: Record<string, string> = {
  draft: 'Draft',
  process: 'Process',
  complete: 'Completed',
  publish: 'PUBLISH',
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => mockEnglishLabels[key] ?? key,
  }),
}));

const mockClosing: { current: Record<string, unknown> } = { current: {} };
const mockCalculate = jest.fn();
const mockRun = jest.fn();
const mockPublish = jest.fn();
const mockCancel = jest.fn();
const mockClear = jest.fn();
const mockConfirm = jest.fn(() => Promise.resolve());

jest.mock('@/adjustments/closing/hooks/useAdjustClosingDetail', () => ({
  useAdjustClosingDetail: () => ({
    adjustClosingDetail: mockClosing.current,
    loading: false,
  }),
  useAdjustClosingDetails: () => ({
    adjustClosingDetails: [],
    adjustClosingDetailsCount: 0,
    loading: false,
    handleFetchMore: jest.fn(),
  }),
}));
jest.mock('@/adjustments/closing/hooks/useAdjustClosingRun', () => ({
  useAdjustClosingRun: () => ({
    calculateAdjust: mockCalculate,
    calculateLoading: false,
    runAdjust: mockRun,
    loading: false,
    clearTransactions: mockClear,
    clearLoading: false,
  }),
}));
jest.mock('@/adjustments/closing/hooks/useAdjustClosingPublish', () => ({
  useAdjustClosingPublish: () => ({
    publishAdjust: mockPublish,
    loading: false,
  }),
}));
jest.mock('@/adjustments/closing/hooks/useAdjustClosingCancel', () => ({
  useAdjustClosingCancel: () => ({ cancelAdjust: mockCancel, loading: false }),
}));
jest.mock('@/adjustments/closing/hooks/useAdjustClosingRemove', () => ({
  useAdjustClosingEntryRemove: () => ({
    removeAdjust: jest.fn(),
    loading: false,
  }),
}));
const mockOpenDetail = jest.fn();
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: () => ({ openDetail: mockOpenDetail }),
}));
jest.mock('@/adjustments/closing/hooks/useAdjustClosingEdit', () => ({
  useAdjustClosingEdit: () => ({ adjustClosingEdit: jest.fn() }),
}));
jest.mock(
  '@/transactions/transaction-form/hooks/useTransactionsDetail',
  () => ({
    useTransactionsDetail: () => ({ transactions: [], loading: false }),
  }),
);
jest.mock(
  '@/transactions/transaction-form/components/TBalanceTableColumns',
  () => ({ tbalanceColumns: () => [] }),
);
jest.mock(
  '@/transactions/transaction-form/components/TBalanceTableRow',
  () => ({
    TBalanceTableRow: () => null,
  }),
);
jest.mock('@/settings/account/components/AccountsInline', () => ({
  AccountsInline: () => null,
}));
jest.mock('@/utils/graphqlMutation', () => ({
  notifyMutationResult: jest.fn(),
}));
jest.mock('ui-modules', () => ({
  useBranchesMain: () => ({ branches: [], loading: false }),
  useDepartmentsMain: () => ({ departments: [], loading: false }),
}));
jest.mock(
  'erxes-ui',
  () => {
    const react = jest.requireActual<typeof import('react')>('react');
    const wrap = ({ children }: { children?: ReactNode }) =>
      react.createElement(react.Fragment, null, children);
    const empty = () => null;
    return {
      Button: (props: React.ComponentProps<'button'>) =>
        react.createElement('button', props),
      DatePicker: empty,
      Input: empty,
      RecordTable: Object.assign(wrap, {
        Provider: wrap,
        Scroll: wrap,
        Header: empty,
        Body: wrap,
        InlineHead: empty,
      }),
      RecordTableInlineCell: wrap,
      Spinner: empty,
      Tabs: Object.assign(wrap, { List: wrap, Trigger: wrap, Content: wrap }),
      TextOverflowTooltip: empty,
      Tooltip: Object.assign(wrap, {
        Provider: wrap,
        Trigger: wrap,
        Content: wrap,
      }),
      useConfirm: () => ({ confirm: mockConfirm }),
    };
  },
  { virtual: true },
);

const openClosing = (status: string, error?: string) => {
  mockClosing.current = {
    _id: 'closing-2026-11',
    status,
    error,
    description: '1234',
    date: '2026-11-11T05:36:48.074Z',
    beginDate: '2026-10-10T00:00:00.000Z',
    createdAt: '2026-11-11T05:36:48.074Z',
    updatedAt: '2026-11-11T05:36:48.074Z',
  };
  render(<AdjustClosingDetail id="closing-2026-11" />);
};

beforeEach(() => jest.clearAllMocks());

describe('closing entry detail actions', () => {
  it('lets the accountant calculate a draft closing shown as "Draft" in English', () => {
    openClosing('draft');

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));

    expect(mockCalculate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'do-transaction' })).toBeNull();
    expect(screen.getByRole('button', { name: 'delete' })).toBeTruthy();
  });

  it('offers to post transactions once the calculation succeeded', () => {
    openClosing('process');

    fireEvent.click(screen.getByRole('button', { name: 'do-transaction' }));

    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('blocks posting when the calculation reported an error but allows recalculating', () => {
    openClosing('process', 'Account 0020 has no balance');

    expect(screen.queryByRole('button', { name: 'do-transaction' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'recalc' }));

    expect(mockCalculate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'delete' })).toBeTruthy();
  });

  it('lets the accountant recalculate or delete a warning closing', () => {
    openClosing('warning');

    expect(screen.getByRole('button', { name: 'recalc' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'delete' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'do-transaction' })).toBeNull();
  });

  it('lets the accountant publish a completed closing labelled "Completed"', () => {
    openClosing('complete');

    fireEvent.click(screen.getByRole('button', { name: 'PUBLISH' }));

    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'delete' })).toBeNull();
  });

  it('clears the transactions of a completed closing after confirmation', async () => {
    openClosing('complete');

    fireEvent.click(screen.getByRole('button', { name: 'Clear transactions' }));

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(mockClear).toHaveBeenCalledTimes(1));
  });

  it('unpublishes a published closing and offers no other action', () => {
    openClosing('publish');

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('opens the edit panel from the detail for an unpublished closing', () => {
    openClosing('complete');

    fireEvent.click(screen.getByRole('button', { name: 'edit' }));

    expect(mockOpenDetail).toHaveBeenCalledWith('closing-2026-11');
  });
});
