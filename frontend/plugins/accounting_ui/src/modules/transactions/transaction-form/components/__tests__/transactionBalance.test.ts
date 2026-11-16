import { sumDtAndCt } from '@/transactions/transaction-form/components/Summary';
import { isHiddenTransaction } from '@/transactions/transaction-form/components/utils';
import { ITransaction } from '@/transactions/types/Transaction';
import { TTrDoc } from '@/transactions/transaction-form/types/JournalForms';

jest.mock('erxes-ui', () => ({}), { virtual: true });
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router-dom', () => ({}));
jest.mock(
  '@/transactions/transaction-form/hooks/useTransactionsRemove',
  () => ({
    useTransactionsRemove: () => ({}),
  }),
);
jest.mock('@/transactions/transaction-form/components/TrRightSidebar', () => ({
  TrRightSidebar: () => null,
}));

const bankReceipt = {
  side: 'dt',
  details: [{ amount: 1_100_000 }],
} as TTrDoc;
const saleIncome = {
  side: 'ct',
  details: [{ amount: 600_000 }, { amount: 400_000 }],
} as TTrDoc;
const vatFollow = {
  side: 'ct',
  details: [{ amount: 100_000 }],
} as ITransaction;

describe('Voucher debit and credit totals', () => {
  it('balances a bank receipt against sale income and its VAT follow', () => {
    expect(sumDtAndCt([bankReceipt, saleIncome], [vatFollow])).toEqual([
      1_100_000, 1_100_000,
    ]);
  });

  it('shows the gap while the VAT line has not been generated yet', () => {
    expect(sumDtAndCt([bankReceipt, saleIncome], [])).toEqual([
      1_100_000, 1_000_000,
    ]);
  });

  it('skips a freshly added tab that has no lines yet', () => {
    const emptyTab = { side: 'dt', details: [] } as unknown as TTrDoc;

    expect(sumDtAndCt([bankReceipt, emptyTab], [])).toEqual([1_100_000, 0]);
  });
});

describe('Hidden transactions in a voucher', () => {
  it('flags a tab whose account the user may not view', () => {
    expect(isHiddenTransaction({ _id: 'tr-1', permission: 'hidden' })).toBe(
      true,
    );
  });

  it('allows a tab the user can edit', () => {
    expect(isHiddenTransaction({ _id: 'tr-1', permission: 'write' })).toBe(
      false,
    );
  });

  it('allows a new tab with no permission info or no data at all', () => {
    expect(isHiddenTransaction({ _id: 'tr-new' })).toBe(false);
    expect(isHiddenTransaction(undefined)).toBe(false);
  });
});
