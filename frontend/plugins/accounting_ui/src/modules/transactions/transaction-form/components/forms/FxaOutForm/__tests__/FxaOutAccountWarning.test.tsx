import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { FxaOutAccountWarning } from '@/transactions/transaction-form/components/forms/FxaOutForm/FxaOutAccountWarning';
import { TAddTransactionGroup } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';
import { useAccountsInline } from '@/settings/account/hooks/useAccounts';
import { FxaAccountMatchingWarning } from '@/transactions/transaction-form/components/forms/FxaAccountMatchingWarning';

let mockConfigs: {
  accountId: string;
  value: { depreciationAccountId?: string };
}[] = [];
let mockAccounts: { _id: string; status: string }[] = [];
const mockRefreshConfigs = jest.fn(async () => undefined);
const mockRefreshAccounts = jest.fn(async () => undefined);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue || key,
  }),
}));
jest.mock(
  '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs',
  () => ({
    useFixedAssetAccountConfigs: () => ({
      configs: mockConfigs,
      loading: false,
      error: undefined,
      refetch: mockRefreshConfigs,
    }),
  }),
);
jest.mock('@/settings/account/hooks/useAccounts', () => ({
  useAccountsInline: jest.fn(() => ({
    accounts: mockAccounts,
    loading: false,
    error: undefined,
    refetch: mockRefreshAccounts,
  })),
}));
jest.mock('react-router', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  return {
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children: React.ReactNode;
    }) => react.createElement('a', { ...props, href: to }, children),
  };
});
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    react.createElement('div', {}, children);
  return {
    Alert: Object.assign(
      ({ children }: { children: React.ReactNode }) =>
        react.createElement('div', { role: 'alert' }, children),
      { Title: wrapper, Description: wrapper },
    ),
  };
});
const useFixture = () =>
  useForm<TAddTransactionGroup>({
    defaultValues: {
      trDocs: [
        {
          journal: TrJournalEnum.FXA_OUT,
          details: [{ accountId: 'asset-a' }],
          followInfos: { accumulatedDepreciationAccountId: 'manual-override' },
        },
      ],
    },
  });
beforeEach(() => {
  mockConfigs = [
    { accountId: 'asset-a', value: { depreciationAccountId: 'dep-a' } },
  ];
  mockAccounts = [
    { _id: 'asset-a', status: 'active' },
    { _id: 'dep-a', status: 'active' },
  ];
  jest.clearAllMocks();
});

test('shared capitalization/revaluation matching warnings include the account settings link', () => {
  render(
    <FxaAccountMatchingWarning message="Revaluation matching is missing" />,
  );
  expect(screen.getByRole('alert').textContent).toContain(
    'Revaluation matching is missing',
  );
  expect(screen.getByRole('link').getAttribute('href')).toBe(
    '/accounting/settings/fixed-assets/accounts-config',
  );
  expect(screen.getByRole('link').getAttribute('target')).toBe('_blank');
});

test('uses the configured assigned depreciation account instead of a manual override', () => {
  const { result } = renderHook(useFixture);
  render(<FxaOutAccountWarning form={result.current} index={0} />);
  expect(
    result.current.getValues(
      'trDocs.0.followInfos.accumulatedDepreciationAccountId',
    ),
  ).toBe('dep-a');
  expect(screen.queryByRole('alert')).toBeNull();
  expect(useAccountsInline).toHaveBeenCalledWith(
    expect.objectContaining({
      variables: { ids: ['asset-a', 'dep-a'], permissionMode: 'write' },
    }),
  );
});

test('sale uses its asset disposal account mapping rather than its revenue account and clears stale links', () => {
  const { result } = renderHook(useFixture);
  act(() => {
    result.current.setValue('trDocs.0.journal', TrJournalEnum.FXA_SALE);
    result.current.setValue('trDocs.0.details.0.accountId', 'revenue');
    result.current.setValue('trDocs.0.followInfos.saleOutAccountId', 'asset-a');
  });
  render(<FxaOutAccountWarning form={result.current} index={0} sale />);
  expect(
    result.current.getValues(
      'trDocs.0.followInfos.accumulatedDepreciationAccountId',
    ),
  ).toBe('dep-a');
  expect(useAccountsInline).toHaveBeenCalledWith(
    expect.objectContaining({
      variables: { ids: ['asset-a', 'dep-a'], permissionMode: 'write' },
    }),
  );
  act(() =>
    result.current.setValue('trDocs.0.followInfos.saleOutAccountId', 'asset-b'),
  );
  expect(
    result.current.getValues(
      'trDocs.0.followInfos.accumulatedDepreciationAccountId',
    ),
  ).toBe('');
  expect(screen.getByRole('alert')).toBeDefined();
});

test('changing to an unconfigured account clears stale depreciation and offers a settings link', () => {
  const { result } = renderHook(useFixture);
  render(<FxaOutAccountWarning form={result.current} index={0} />);
  act(() => result.current.setValue('trDocs.0.details.0.accountId', 'asset-b'));
  expect(
    result.current.getValues(
      'trDocs.0.followInfos.accumulatedDepreciationAccountId',
    ),
  ).toBe('');
  expect(screen.getByRole('alert')).toBeDefined();
  expect(screen.getByRole('link').getAttribute('href')).toBe(
    '/accounting/settings/fixed-assets/accounts-config',
  );
  expect(screen.getByRole('link').getAttribute('target')).toBe('_blank');
});

test('an unavailable assigned account shows the same form-level warning', () => {
  mockAccounts = [{ _id: 'asset-a', status: 'active' }];
  const { result } = renderHook(useFixture);
  render(<FxaOutAccountWarning form={result.current} index={0} />);
  expect(screen.getByRole('alert')).toBeDefined();
});

test('returning from settings refreshes links and updates the warning without reloading', () => {
  mockConfigs = [];
  const { result } = renderHook(useFixture);
  const view = render(<FxaOutAccountWarning form={result.current} index={0} />);
  fireEvent(window, new Event('focus'));
  expect(mockRefreshConfigs).toHaveBeenCalledTimes(1);
  expect(mockRefreshAccounts).toHaveBeenCalledTimes(1);
  mockConfigs = [
    { accountId: 'asset-a', value: { depreciationAccountId: 'dep-a' } },
  ];
  view.rerender(<FxaOutAccountWarning form={result.current} index={0} />);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(
    result.current.getValues(
      'trDocs.0.followInfos.accumulatedDepreciationAccountId',
    ),
  ).toBe('dep-a');
});
