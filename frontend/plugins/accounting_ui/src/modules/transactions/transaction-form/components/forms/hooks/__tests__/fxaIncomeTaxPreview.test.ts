import {
  buildFxaIncomeTaxPreview,
  mergeFxaIncomeTaxFollows,
} from '@/transactions/transaction-form/components/forms/hooks/fxaIncomeTaxPreview';
import { JOURNALS_BY_JOURNAL } from '@/transactions/transaction-form/contants/defaultValues';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';
import type { ITransaction } from '@/transactions/types/Transaction';

jest.mock('react-i18next', () => ({
  getI18n: () => ({ t: (value: string) => value }),
}));
jest.mock('ui-modules', () => ({ CustomerType: { CUSTOMER: 'customer' } }));

const accounts = {
  cost: {
    accountId: 'cost',
    taxAssetAccountId: 'dta',
    taxLiabilityAccountId: 'dtl',
  },
};
const income = (book = 15000, tax = 18000) =>
  JOURNALS_BY_JOURNAL(TrJournalEnum.FXA_INCOME, {
    _id: 'income',
    parentId: 'parent',
    ptrId: 'pointer',
    description: 'Opening assets',
    details: [
      {
        _id: 'source',
        accountId: 'cost',
        count: 5,
        amount: 250000,
        unitPrice: 50000,
        followInfos: {
          fixedAssetCategoryId: 'category',
          fixedAssetCode: 'A',
          fixedAssetName: 'Asset',
          hasTaxDepreciation: true,
          preDeprecation: book,
          taxPreDeprecation: tax,
          incomeTaxRate: 10,
        },
      },
    ],
  });

test.each([
  [15000, 18000, 'dtl', TR_SIDES.CREDIT, 300],
  [18000, 15000, 'dta', TR_SIDES.DEBIT, 300],
])(
  'opening book %s and tax %s show only the tax balance for manual balancing',
  (book, tax, accountId, side, amount) => {
    const result = buildFxaIncomeTaxPreview(income(book, tax), accounts);
    expect(result.error).toBeUndefined();
    expect(result.follows).toHaveLength(1);
    expect(result.follows[0]).toMatchObject({
      side,
      originId: 'income',
      originType: 'fxaDeferredTax',
      journal: TrJournalEnum.MAIN,
      details: [
        expect.objectContaining({
          accountId,
          amount,
          count: 0,
          originId: 'source',
        }),
      ],
    });
  },
);

test('disabling tax, equal totals and an explicit zero rate clear opening tax follows', () => {
  const transaction = income();
  transaction.details[0].followInfos = {
    ...transaction.details[0].followInfos,
    hasTaxDepreciation: false,
  };
  expect(buildFxaIncomeTaxPreview(transaction, {}).follows).toEqual([]);
  expect(buildFxaIncomeTaxPreview(income(15000, 15000), {}).follows).toEqual(
    [],
  );
  transaction.details[0].followInfos = {
    ...transaction.details[0].followInfos,
    hasTaxDepreciation: true,
    incomeTaxRate: 0,
  };
  expect(buildFxaIncomeTaxPreview(transaction, {}).follows).toEqual([]);
});

test('missing tax mapping or rate produces an error before a misleading preview', () => {
  expect(buildFxaIncomeTaxPreview(income(), {}).error).toBe(
    'fxa-income-tax-accounts-required',
  );
  const transaction = income();
  transaction.details[0].followInfos = {
    ...transaction.details[0].followInfos,
    incomeTaxRate: undefined,
  };
  expect(buildFxaIncomeTaxPreview(transaction, accounts).error).toBe(
    'fxa-income-tax-rate-required',
  );
});

test('preview replaces legacy tax expense rows while retaining book depreciation and manual roots', () => {
  const preview = buildFxaIncomeTaxPreview(income(), accounts).follows;
  const saved = {
    ...preview[0],
    _id: 'saved',
    details: preview[0].details.map((row) => ({ ...row, _id: 'saved-detail' })),
  };
  const legacyExpense = {
    ...saved,
    _id: 'expense',
    side: TR_SIDES.DEBIT,
    details: [{ accountId: 'expense', amount: 300 }],
  };
  const book: ITransaction = {
    _id: 'book',
    originId: 'income',
    originType: 'fxaDepIn',
    details: [],
  };
  const manual: ITransaction = {
    _id: 'manual',
    journal: TrJournalEnum.MAIN,
    details: [],
  };
  const next = mergeFxaIncomeTaxFollows(
    [saved, legacyExpense, book, manual],
    preview,
    'income',
  );
  expect(next.map((row) => row._id)).toEqual(['book', 'manual', 'saved']);
  expect(next[2].details[0]._id).toBe('saved-detail');
  expect(mergeFxaIncomeTaxFollows(next, preview, 'income')).toBe(next);
  expect(mergeFxaIncomeTaxFollows(next, [], 'income')).toEqual([book, manual]);
});
