import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdjustFixedAssetDetail } from '@/adjustments/fxa/components/AdjustFixedAssetDetail';

let mockStatus = 'complete';
let mockError = '';
let mockTaxRate: number | undefined = 10;
let mockParent: string | undefined = 'generated-parent';
const mockRun = jest.fn();
const mockCancel = jest.fn();
const mockClear = jest.fn();
const mockPublish = jest.fn();
const mockRemove = jest.fn();
const mockConfirm = jest.fn();
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    react.createElement('div', {}, children);
  const root =
    () =>
    ({ children }: { children: React.ReactNode }) =>
      react.createElement('div', {}, children);
  const table = Object.assign(root(), {
    Provider: wrapper,
    Scroll: wrapper,
    Header: () => null,
    Body: wrapper,
    RowList: () => null,
  });
  return {
    useQueryState: () => ['adjust'],
    useConfirm: () => ({ confirm: mockConfirm }),
    Button: (props: React.ComponentProps<'button'>) =>
      react.createElement('button', props),
    Spinner: () => null,
    Tabs: Object.assign(root(), {
      List: wrapper,
      Trigger: wrapper,
      Content: wrapper,
    }),
    RecordTable: table,
    Dialog: Object.assign(root(), {
      Trigger: wrapper,
      Content: () => null,
      Header: wrapper,
      Title: wrapper,
      Description: wrapper,
      Footer: wrapper,
      Close: wrapper,
    }),
    Form: Object.assign(root(), { Field: () => null }),
  };
});
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: { FormItem: () => null },
}));
jest.mock('@/adjustments/fxa/components/AdjustFxaDetailColumns', () => ({
  adjustFxaDetailColumns: () => [],
}));
jest.mock('@/adjustments/fxa/components/AdjustFixedAssetTransactions', () => ({
  AdjustFixedAssetTransactions: ({ parentId }: { parentId?: string }) => (
    <div data-testid="linked-parent">{parentId}</div>
  ),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetDetail', () => ({
  useAdjustFixedAssetDetail: () => ({
    adjustFixedAsset: {
      _id: 'adjust',
      status: mockStatus,
      error: mockError,
      taxRate: mockTaxRate,
    },
    loading: false,
  }),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFxaDetails', () => ({
  useAdjustFxaDetails: () => ({
    adjustFxaDetails: [{ transactionId: mockParent }],
    adjustFxaDetailsCount: 1,
    loading: false,
  }),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetRun', () => ({
  useAdjustFixedAssetRun: () => ({
    runAdjustFixedAsset: mockRun,
    loading: false,
  }),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetRemove', () => ({
  useAdjustFixedAssetRemove: () => ({
    removeAdjustFixedAsset: mockRemove,
    loading: false,
  }),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetTransaction', () => ({
  useAdjustFixedAssetTransaction: () => ({
    createTransaction: jest.fn(),
    loading: false,
  }),
}));
jest.mock('@/adjustments/fxa/hooks/useAdjustFixedAssetActions', () => ({
  useAdjustFixedAssetActions: () => ({
    cancel: mockCancel,
    clear: mockClear,
    publish: mockPublish,
    loading: false,
  }),
}));

beforeEach(() => {
  mockStatus = 'complete';
  mockError = '';
  mockTaxRate = 10;
  mockParent = 'generated-parent';
  jest.clearAllMocks();
});
test('completed periods expose rerun/cancel and their generated journal parent', () => {
  render(<AdjustFixedAssetDetail />);
  fireEvent.click(screen.getByRole('button', { name: 'run' }));
  fireEvent.click(screen.getByRole('button', { name: 'cancel' }));
  expect(mockRun).toHaveBeenCalledTimes(1);
  expect(mockCancel).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: 'delete' })).toBeNull();
  expect(screen.getByTestId('linked-parent').textContent).toBe(
    'generated-parent',
  );
});
test('calculated periods can post or clear, with deletion restored before posting', () => {
  mockStatus = 'process';
  mockParent = undefined;
  render(<AdjustFixedAssetDetail />);
  expect(
    screen.getByRole('button', { name: 'depreciation-transaction' }),
  ).toHaveProperty('disabled', false);
  fireEvent.click(screen.getByRole('button', { name: 'clear' }));
  expect(mockClear).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'delete' })).toHaveProperty(
    'disabled',
    false,
  );
});
test('deleting a calculated period waits for confirmation', async () => {
  mockStatus = 'process';
  mockParent = undefined;
  mockConfirm.mockReturnValueOnce(new Promise(() => undefined));
  const { unmount } = render(<AdjustFixedAssetDetail />);
  fireEvent.click(screen.getByRole('button', { name: 'delete' }));
  expect(mockConfirm).toHaveBeenCalledTimes(1);
  expect(mockRemove).not.toHaveBeenCalled();
  unmount();

  mockConfirm.mockResolvedValueOnce(undefined);
  render(<AdjustFixedAssetDetail />);
  fireEvent.click(screen.getByRole('button', { name: 'delete' }));
  await waitFor(() => expect(mockRemove).toHaveBeenCalledTimes(1));
});
test('calculation errors block posting while retaining rerun controls', () => {
  mockStatus = 'process';
  mockError = 'invalid source';
  render(<AdjustFixedAssetDetail />);
  expect(
    screen.queryByRole('button', { name: 'depreciation-transaction' }),
  ).toBeNull();
  expect(screen.getByRole('button', { name: 'run' })).toBeDefined();
});
test('published periods must cancel before rerun or delete', () => {
  mockStatus = 'publish';
  render(<AdjustFixedAssetDetail />);
  expect(screen.getByRole('button', { name: 'cancel' })).toBeDefined();
  expect(screen.queryByRole('button', { name: 'run' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'delete' })).toBeNull();
});
test('running periods do not expose conflicting operations', () => {
  mockStatus = 'running';
  render(<AdjustFixedAssetDetail />);
  expect(screen.queryByRole('button', { name: 'run' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'cancel' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'delete' })).toBeNull();
});

test('legacy periods explain missing tax rate and block posting until recalculation', () => {
  mockStatus = 'process';
  mockTaxRate = undefined;
  render(<AdjustFixedAssetDetail />);
  expect(screen.getByRole('alert').textContent).toBe('income-tax-rate-missing');
  expect(
    screen.queryByRole('button', { name: 'depreciation-transaction' }),
  ).toBeNull();
  expect(screen.getByRole('button', { name: 'run' })).toBeDefined();
});

test('published legacy periods explain how to enable tax calculation', () => {
  mockTaxRate = undefined;
  mockStatus = 'publish';
  render(<AdjustFixedAssetDetail />);
  expect(screen.getByRole('alert').textContent).toBe(
    'income-tax-rate-missing-posted',
  );
  expect(screen.getByRole('button', { name: 'cancel' })).toBeDefined();
});
