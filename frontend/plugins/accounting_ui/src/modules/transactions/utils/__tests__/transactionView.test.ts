import { readTransactionViews, toTransactionView } from '../transactionView';
import { JOURNALS_BY_JOURNAL } from '../../transaction-form/contants/defaultValues';
import { TrJournalEnum } from '../../types/constants';

jest.mock(
  'ui-modules',
  () => ({ CustomerType: { CUSTOMER: 'customer', COMPANY: 'company' } }),
  { virtual: true },
);

const transaction = (
  journal: TrJournalEnum,
  metadata: Record<string, unknown>,
) =>
  toTransactionView({
    _id: 'tr-1',
    journal,
    customerType: 'customer',
    details: [{ _id: 'detail-1', accountId: 'account-1', amount: 10 }],
    ...metadata,
  });

test('bank metadata survives response conversion and form initialization', () => {
  const view = transaction(TrJournalEnum.BANK, {
    extraData: { bank: 'bank-1', bankAccount: '123', custom: 'preserve' },
  });
  expect(JOURNALS_BY_JOURNAL(TrJournalEnum.BANK, view).extraData).toEqual({
    bank: 'bank-1',
    bankAccount: '123',
    custom: 'preserve',
  });
});

test('optional null JSON fields do not discard valid sibling metadata', () => {
  const view = transaction(TrJournalEnum.BANK, {
    extraData: { bank: null, bankAccount: '123', discount: null, custom: null },
    followInfos: { saleOutAccountId: 'inventory', saleTransactionId: null },
  });
  expect(view.extraData?.bankAccount).toBe('123');
  expect(view.extraData?.custom).toBeNull();
  expect(view.followInfos?.saleOutAccountId).toBe('inventory');
});

test('invalid saved metadata cannot silently clear valid sibling values', () => {
  expect(() =>
    transaction(TrJournalEnum.BANK, {
      extraData: {
        bankAccount: '123',
        discount: 'invalid',
        custom: 'preserve',
      },
    }),
  ).toThrow('Invalid saved transaction extraData');
});

test('invalid saved split metadata cannot silently disable the split', () => {
  expect(() =>
    transaction(TrJournalEnum.INV_INCOME, {
      details: [
        {
          _id: 'detail-1',
          followInfos: {
            invSplit: { hasSplit: true, productId: 'result', ratio: 0 },
          },
        },
      ],
    }),
  ).toThrow('Invalid saved transaction details.detail-1.followInfos');
});

test('a malformed row rejects the whole editable group and returns an actionable error', () => {
  const result = readTransactionViews([
    { _id: 'valid', extraData: { bankAccount: '123' } },
    { _id: 'invalid', extraData: { discount: 'invalid' } },
  ]);
  expect(result.transactions).toBeUndefined();
  expect(result.error?.message).toContain(
    'Invalid saved transaction extraData',
  );
});

test('inventory income expenses survive response conversion and form initialization', () => {
  const extraData = {
    invIncomeExpenses: [
      {
        _id: 'expense-1',
        title: 'Freight',
        rule: 'amount',
        amount: 10,
        accountId: 'expense-account',
      },
    ],
  };
  expect(
    JOURNALS_BY_JOURNAL(
      TrJournalEnum.INV_INCOME,
      transaction(TrJournalEnum.INV_INCOME, { extraData }),
    ).extraData,
  ).toEqual(extraData);
});

test.each([TrJournalEnum.INV_SALE, TrJournalEnum.INV_SALE_RETURN])(
  'sale accounts survive editing %s',
  (journal) => {
    const followInfos = {
      saleOutAccountId: 'inventory',
      saleCostAccountId: 'cost',
      saleTransactionId: 'original-sale',
    };
    expect(
      JOURNALS_BY_JOURNAL(journal, transaction(journal, { followInfos }))
        .followInfos,
    ).toEqual(followInfos);
  },
);

test('inventory destination survives editing', () => {
  const followInfos = {
    moveInAccountId: 'destination',
    moveInBranchId: 'branch',
    moveInDepartmentId: 'department',
  };
  expect(
    JOURNALS_BY_JOURNAL(
      TrJournalEnum.INV_MOVE,
      transaction(TrJournalEnum.INV_MOVE, { followInfos }),
    ).followInfos,
  ).toEqual(followInfos);
});

test('tax transaction keeps its journal during initialization', () => {
  expect(
    JOURNALS_BY_JOURNAL(TrJournalEnum.TAX, transaction(TrJournalEnum.TAX, {}))
      .journal,
  ).toBe(TrJournalEnum.TAX);
});

test('legacy inventory splits without hasSplit remain enabled after editing', () => {
  const view = transaction(TrJournalEnum.INV_INCOME, {
    details: [
      {
        _id: 'detail-1',
        accountId: 'account-1',
        amount: 10,
        productId: 'source',
        followInfos: { invSplit: { productId: 'result', ratio: 2 } },
      },
    ],
  });
  const draft = JOURNALS_BY_JOURNAL(TrJournalEnum.INV_INCOME, view);
  expect(draft.details[0].followInfos).toEqual({
    invSplit: { hasSplit: true, productId: 'result', ratio: 2 },
  });
});
