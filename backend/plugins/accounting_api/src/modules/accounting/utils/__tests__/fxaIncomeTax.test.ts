import type { IModels } from '~/connectionResolvers';
import type {
  ITransaction,
  ITransactionDocument,
} from '../../@types/transaction';
import {
  JOURNALS,
  TR_FOLLOW_TYPES,
  TR_SIDES,
  TR_STATUSES,
} from '../../@types/constants';
import {
  getFxaIncomeTaxDocuments,
  syncFxaIncomeDeferredTax,
} from '../fxaIncomeTax';
import { assertCanWriteTransactionAccounts } from '../trPermissions';
import { getFxaDeferredTaxTransactions } from '../fxaDeferredTax';

jest.mock('../trPermissions', () => ({
  assertCanWriteTransactionAccounts: jest.fn(),
}));
const source = (
  book = 1000,
  tax = 600,
  enabled: boolean | undefined = true,
): ITransactionDocument =>
  ({
    _id: 'income',
    date: new Date('2026-01-01'),
    journal: JOURNALS.FXA_INCOME,
    status: TR_STATUSES.COMPLETE,
    description: 'Opening assets',
    parentId: 'parent',
    ptrId: 'pointer',
    details: [
      {
        _id: 'source-detail',
        fixedAssetId: 'asset',
        accountId: 'cost',
        branchId: 'branch',
        departmentId: 'department',
        count: 5,
        amount: 5000,
        unitPrice: 1000,
        followInfos: {
          hasTaxDepreciation: enabled,
          preDeprecation: book,
          taxPreDeprecation: tax,
          incomeTaxRate: 10,
        },
      },
    ],
  } as ITransactionDocument);
const fixture = (existing: ITransactionDocument[] = [], withExpense = true) => {
  const raw = {
    Configs: {
      getConfigs: jest.fn(async () => [
        {
          subId: 'cost',
          value: {
            taxAssetAccountId: 'dta',
            taxLiabilityAccountId: 'dtl',
            ...(withExpense ? { TaxExpenseAccountId: 'tax-expense' } : {}),
          },
        },
      ]),
    },
    Transactions: {
      find: jest.fn(() => ({ lean: async () => existing })),
      createTransaction: jest.fn(async (doc: ITransaction) => ({
        ...doc,
        _id: `tax-${doc.side}`,
      })),
      updateTransaction: jest.fn(async (_id: string, doc: ITransaction) => ({
        ...doc,
        _id,
      })),
      deleteMany: jest.fn(),
    },
  };
  return { raw, models: raw as unknown as IModels };
};
const signed = (docs: ITransaction[], accountId: string) =>
  docs.reduce(
    (sum, doc) =>
      sum +
      doc.details.reduce(
        (value, row) =>
          row.accountId === accountId
            ? value + row.amount * (doc.side === TR_SIDES.DEBIT ? 1 : -1)
            : value,
        0,
      ),
    0,
  );

beforeEach(() => jest.clearAllMocks());

test.each([
  [1000, 600, 40, 0],
  [600, 1000, 0, -40],
])(
  'opening book %s and tax %s generate correct deferred tax without multiplying quantity',
  async (book, tax, dta, dtl) => {
    const { models } = fixture();
    const { docs } = await getFxaIncomeTaxDocuments(
      models,
      'user',
      source(book, tax),
    );
    expect(signed(docs, 'dta')).toBe(dta);
    expect(signed(docs, 'dtl')).toBe(dtl);
    expect(signed(docs, 'tax-expense')).toBe(0);
    expect(
      docs.every(
        (doc) =>
          doc.originId === 'income' &&
          doc.originType === TR_FOLLOW_TYPES.FXA_DEFERRED_TAX &&
          doc.description === 'Opening assets' &&
          doc.parentId === 'parent' &&
          doc.ptrId === 'pointer',
      ),
    ).toBe(true);
    expect(
      docs
        .flatMap((doc) => doc.details)
        .every(
          (row) =>
            row.count === 0 &&
            row.unitPrice === 0 &&
            row.originId === 'source-detail' &&
            row.branchId === 'branch' &&
            row.departmentId === 'department',
        ),
    ).toBe(true);
    expect(assertCanWriteTransactionAccounts).toHaveBeenCalled();
  },
);

test('opening tax does not require an income tax expense account', async () => {
  const { models } = fixture([], false);
  const { docs } = await getFxaIncomeTaxDocuments(models, 'user', source());
  expect(docs).toHaveLength(1);
  expect(signed(docs, 'dta')).toBe(40);
  expect(signed(docs, 'tax-expense')).toBe(0);
});

test('opening tax still requires its deferred tax balance account', async () => {
  const { models, raw } = fixture([], false);
  raw.Configs.getConfigs.mockResolvedValueOnce([]);
  await expect(
    getFxaIncomeTaxDocuments(models, 'user', source()),
  ).rejects.toThrow('Configure deferred tax asset/liability accounts');
  expect(raw.Transactions.createTransaction).not.toHaveBeenCalled();
});

test('resaving removes a legacy automatic expense counterpart and preserves manual balancing roots', async () => {
  const initial = fixture();
  const { docs } = await getFxaIncomeTaxDocuments(
    initial.models,
    'user',
    source(),
  );
  const asset = {
    ...docs[0],
    _id: 'old-dt',
    details: docs[0].details.map((row) => ({ ...row, _id: 'asset-detail' })),
  } as ITransactionDocument;
  const expense = {
    ...asset,
    _id: 'old-expense',
    side: TR_SIDES.CREDIT,
    details: asset.details.map((row) => ({ ...row, accountId: 'tax-expense' })),
  };
  const manual = {
    ...expense,
    _id: 'manual',
    originId: undefined,
    originType: undefined,
  };
  const { models, raw } = fixture([asset, expense, manual]);
  await syncFxaIncomeDeferredTax(models, 'user', source());
  expect(raw.Transactions.updateTransaction).toHaveBeenCalledTimes(1);
  expect(raw.Transactions.updateTransaction).toHaveBeenCalledWith(
    'old-dt',
    expect.objectContaining({
      journal: JOURNALS.FXA_DEFERRED_TAX,
      details: [
        expect.objectContaining({
          _id: 'asset-detail',
          accountId: 'dta',
          amount: 40,
        }),
      ],
    }),
    'user',
  );
  expect(raw.Transactions.deleteMany).toHaveBeenCalledWith({
    _id: { $in: ['old-expense'] },
  });
});

test.each([false, undefined])(
  'inactive toggle %s ignores different hidden tax opening totals',
  async (enabled) => {
    const { models, raw } = fixture();
    const transaction = source();
    transaction.details[0].followInfos = {
      ...transaction.details[0].followInfos,
      hasTaxDepreciation: enabled,
      incomeTaxRate: undefined,
    };
    expect(
      (await getFxaIncomeTaxDocuments(models, 'user', transaction)).docs,
    ).toEqual([]);
    expect(raw.Configs.getConfigs).not.toHaveBeenCalled();
  },
);

test('enabled equal opening totals still require the acquisition income tax percentage', async () => {
  const { models } = fixture();
  const transaction = source(1000, 1000);
  transaction.details[0].followInfos = {
    ...transaction.details[0].followInfos,
    incomeTaxRate: undefined,
  };
  await expect(
    getFxaIncomeTaxDocuments(models, 'user', transaction),
  ).rejects.toThrow('income tax rate');
});

test('missing income tax percentage fails before financial writes', async () => {
  const { models, raw } = fixture();
  const transaction = source();
  transaction.details[0].followInfos = {
    ...transaction.details[0].followInfos,
    incomeTaxRate: undefined,
  };
  await expect(
    syncFxaIncomeDeferredTax(models, 'user', transaction),
  ).rejects.toThrow('income tax rate');
  expect(raw.Transactions.createTransaction).not.toHaveBeenCalled();
  expect(raw.Transactions.deleteMany).not.toHaveBeenCalled();
});

test('income edit updates existing sides and detail ids without creating duplicate journals', async () => {
  const initial = fixture();
  const { docs } = await getFxaIncomeTaxDocuments(
    initial.models,
    'user',
    source(),
  );
  const existing = docs.map((doc) => ({
    ...doc,
    journal: JOURNALS.MAIN,
    _id: `old-${doc.side}`,
    details: doc.details.map((row) => ({ ...row, _id: `detail-${doc.side}` })),
  })) as ITransactionDocument[];
  const { models, raw } = fixture(existing);
  await syncFxaIncomeDeferredTax(models, 'user', source(1200, 600));
  expect(raw.Transactions.createTransaction).not.toHaveBeenCalled();
  expect(raw.Transactions.updateTransaction).toHaveBeenCalledTimes(1);
  expect(raw.Transactions.updateTransaction).toHaveBeenCalledWith(
    'old-dt',
    expect.objectContaining({
      details: [expect.objectContaining({ _id: 'detail-dt', amount: 60 })],
    }),
    'user',
  );
  expect(raw.Transactions.deleteMany).not.toHaveBeenCalled();
});

test('turning off the toggle removes source-owned opening tax rows', async () => {
  const initial = fixture();
  const { docs } = await getFxaIncomeTaxDocuments(
    initial.models,
    'user',
    source(),
  );
  const existing = docs.map((doc) => ({
    ...doc,
    _id: `old-${doc.side}`,
  })) as ITransactionDocument[];
  const { models, raw } = fixture(existing);
  await syncFxaIncomeDeferredTax(models, 'user', source(1000, 600, false));
  expect(raw.Transactions.deleteMany).toHaveBeenCalledWith({
    _id: { $in: ['old-dt'] },
  });
  expect(raw.Transactions.createTransaction).not.toHaveBeenCalled();
  expect(assertCanWriteTransactionAccounts).toHaveBeenCalledWith(
    expect.objectContaining({ oldTrs: existing }),
  );
});

test('opening deferred tax does not read or subtract another incomes balances', async () => {
  const { models, raw } = fixture();
  await getFxaIncomeTaxDocuments(models, 'user', source());
  expect(raw.Transactions.find).toHaveBeenCalledTimes(1);
  expect(raw.Transactions.find).toHaveBeenCalledWith({
    originId: 'income',
    originType: TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
  });
});

test('account permission denial prevents every opening tax write and cleanup', async () => {
  const { models, raw } = fixture();
  jest
    .mocked(assertCanWriteTransactionAccounts)
    .mockRejectedValueOnce(new Error('denied'));
  await expect(
    syncFxaIncomeDeferredTax(models, 'user', source()),
  ).rejects.toThrow('denied');
  expect(raw.Transactions.createTransaction).not.toHaveBeenCalled();
  expect(raw.Transactions.updateTransaction).not.toHaveBeenCalled();
  expect(raw.Transactions.deleteMany).not.toHaveBeenCalled();
});

test('income tax follows use the same header location fallback as opening book depreciation', async () => {
  const { models } = fixture();
  const transaction = source();
  transaction.branchId = 'header-branch';
  transaction.departmentId = 'header-department';
  transaction.details[0].branchId = '';
  transaction.details[0].departmentId = '';
  const { docs } = await getFxaIncomeTaxDocuments(models, 'user', transaction);
  expect(
    docs
      .flatMap((doc) => doc.details)
      .every(
        (row) =>
          row.branchId === 'header-branch' &&
          row.departmentId === 'header-department',
      ),
  ).toBe(true);
});

test('next adjustment subtracts the already recognized opening deferred tax instead of posting it twice', async () => {
  const initial = fixture();
  const { docs: opening } = await getFxaIncomeTaxDocuments(
    initial.models,
    'user',
    source(),
  );
  const posted = opening.map((doc) => ({
    ...doc,
    _id: `opening-${doc.side}`,
  })) as ITransactionDocument[];
  const { models } = fixture(posted);
  const docs = await getFxaDeferredTaxTransactions(
    models,
    { _id: 'adjust', date: new Date('2026-01-31') },
    [
      {
        fixedAssetId: 'asset',
        accountId: 'cost',
        branchId: 'branch',
        departmentId: 'department',
        accumulatedDepreciation: 1000,
        taxAccumulatedDepreciation: 550,
        incomeTaxRate: 10,
      },
    ],
  );
  expect(signed(docs, 'dta')).toBe(5);
  expect(signed(docs, 'tax-expense')).toBe(-5);
});
