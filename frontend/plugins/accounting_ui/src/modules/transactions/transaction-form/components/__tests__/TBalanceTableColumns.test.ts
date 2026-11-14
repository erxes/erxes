import { getTBalanceLocation } from '@/transactions/transaction-form/components/TBalanceTableColumns';
import { ITBalanceTransaction } from '@/transactions/transaction-form/types/TBalance';

jest.mock('erxes-ui', () => ({}), { virtual: true });
jest.mock('ui-modules', () => ({}), { virtual: true });
jest.mock('@/settings/fixed-assets/hooks/useFixedAssetDetail', () => ({}));
jest.mock('@/settings/account/components/AccountsInline', () => ({}));
jest.mock('@/transactions/transaction-form/states/trStates', () => ({}));

const row = (
  changes: Partial<ITBalanceTransaction> = {},
): ITBalanceTransaction => ({
  date: new Date('2025-07-01'),
  journalIndex: '0',
  side: 'dt',
  detail: { amount: 0 },
  ...changes,
});

test('detail ids override stale location objects and trigger a name lookup', () => {
  const value = row({
    branchId: 'first',
    branch: { _id: 'first', title: 'First' },
    detail: {
      branchId: 'second',
      branch: { _id: 'first', title: 'First' },
      departmentId: 'finance',
    },
  });
  expect(getTBalanceLocation(value, 'branch')).toEqual({
    id: 'second',
    location: undefined,
  });
  expect(getTBalanceLocation(value, 'department')).toEqual({
    id: 'finance',
    location: undefined,
  });
});

test('missing detail location uses the header; explicitly unassigned detail does not', () => {
  const value = row({
    branchId: 'first',
    branch: { _id: 'first', title: 'First' },
  });
  expect(getTBalanceLocation(value, 'branch').location?.title).toBe('First');
  value.detail.branchId = '';
  expect(getTBalanceLocation(value, 'branch')).toEqual({
    id: '',
    location: undefined,
  });
});
