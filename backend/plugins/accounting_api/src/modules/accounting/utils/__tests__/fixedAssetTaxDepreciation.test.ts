import { calculateFxaTaxDepreciation } from '../fxaDepreciation';
import type { IModels } from '~/connectionResolvers';
import type { IFxaLedgerAsset } from '../fxaLedger';
import type {
  IAdjustFixedAssetDocument,
  IAdjustFxaDetail,
} from '../../@types/adjustFixedAsset';
import type { ITransaction } from '../../@types/transaction';
import { createAdjustFixedAssetTransaction } from '../adjustFixedAssets';
jest.mock('../fxaIncomeTaxRates', () => ({
  getFxaIncomeTaxRates: jest.fn(async () => new Map([['asset', 10]])),
}));
import { getFxaDeferredTaxTransactions } from '../fxaDeferredTax';
import { JOURNALS, TR_SIDES } from '../../@types/constants';

const asset: IFxaLedgerAsset = {
  _id: 'asset',
  code: 'A',
  name: 'Asset',
  categoryId: 'category',
  accountId: 'cost',
  count: 2,
  currentCount: 2,
  originalCost: 1200,
  accumulatedDepreciation: 0,
  bookValue: 2400,
  acquisitionDate: new Date('2026-01-01T00:00:00'),
  depreciationStartDate: new Date('2026-01-01T00:00:00'),
  depreciationMethod: 'straightLine',
  annualDepreciationRate: 10,
  salvageValue: 0,
  taxDepreciationMethod: 'straightLine',
  taxAnnualDepreciationRate: 20,
  taxSalvageValue: 0,
};
const calculate = (
  overrides: Partial<Parameters<typeof calculateFxaTaxDepreciation>[0]> = {},
) =>
  calculateFxaTaxDepreciation({
    fixedAsset: asset,
    beginDate: new Date('2026-02-01T00:00:00'),
    endDate: new Date('2026-02-28T00:00:00'),
    corrections: [],
    movements: [
      {
        fixedAssetId: 'asset',
        date: new Date('2026-01-01T00:00:00'),
        countDelta: 2,
        branchId: 'a',
      },
    ],
    ...overrides,
  });

test('tax schedule replays acquisition and separates period expense from accumulated depreciation', () => {
  const row = calculate().get('a:');
  expect(row?.amount).toBeCloseTo(40);
  expect(row?.accumulated).toBeCloseTo(80);
  expect(row?.error).toBe('');
});

test.each([
  'straightLine',
  'sumOfYearsDigits',
  'doubleDecliningBalance',
  'decliningBalance',
])('%s tax method caps at residual value', (method) => {
  const row = calculate({
    fixedAsset: {
      ...asset,
      taxDepreciationMethod: method,
      taxOpeningDepreciation: 1099,
      taxSalvageValue: 100,
    },
  }).get('a:');
  expect(row?.accumulated).toBeCloseTo(2200);
});

test('book cost/rate corrections never reset the tax cost or schedule', () => {
  const result = calculate({
    corrections: [
      {
        fixedAssetId: 'asset',
        date: new Date('2026-02-01T00:00:00'),
        rules: {
          originalCost: 5000,
          annualDepreciationRate: 50,
          depreciationBase: 3000,
          depreciationStartDate: new Date('2026-02-01T00:00:00'),
        },
      },
    ],
  });
  expect(result.get('a:')?.accumulated).toBeCloseTo(80);
});

test('tax rate correction is effective only from its business date', () => {
  const result = calculate({
    corrections: [
      {
        fixedAssetId: 'asset',
        date: new Date('2026-02-15T00:00:00'),
        rules: { taxAnnualDepreciationRate: 40 },
      },
    ],
  });
  expect(result.get('a:')?.amount).toBeCloseTo(60);
  expect(result.get('a:')?.accumulated).toBeCloseTo(100);
});

test('partial disposal removes proportional tax basis and movement reallocates balances without depreciation duplication', () => {
  const result = calculate({
    movements: [
      {
        fixedAssetId: 'asset',
        date: new Date('2026-01-01T00:00:00'),
        countDelta: 2,
        branchId: 'a',
      },
      {
        fixedAssetId: 'asset',
        date: new Date('2026-02-01T00:00:00'),
        countDelta: -2,
        branchId: 'a',
      },
      {
        fixedAssetId: 'asset',
        date: new Date('2026-02-01T00:00:00'),
        countDelta: 1,
        branchId: 'b',
      },
    ],
  });
  expect(result.get('a:')?.accumulated).toBe(0);
  expect(result.get('b:')?.amount).toBeCloseTo(20);
  expect(result.get('b:')?.accumulated).toBeCloseTo(40);
});

test.each([0, -1, Infinity, 101])(
  'invalid tax annual rate %s returns an actionable error',
  (rate) => {
    expect(
      calculate({
        fixedAsset: { ...asset, taxAnnualDepreciationRate: rate },
      }).get('a:')?.error,
    ).toContain('tax depreciation rules');
  },
);

const adjust = {
  _id: 'adjust',
  date: new Date('2026-02-28T00:00:00'),
  description: 'Depreciation',
} as IAdjustFixedAssetDocument;
const detail: IAdjustFxaDetail & { incomeTaxRate: number } = {
  adjustId: 'adjust',
  incomeTaxRate: 10,
  fixedAssetId: 'asset',
  accountId: 'cost',
  branchId: 'a',
  originalCost: 2400,
};
const fixtures = (
  posted: ITransaction[] = [],
  expense: string | undefined = 'expense',
) =>
  ({
    Configs: {
      getConfigs: async () => [
        {
          subId: 'cost',
          value: {
            taxAssetAccountId: 'dta',
            taxLiabilityAccountId: 'dtl',
            TaxExpenseAccountId: expense,
          },
        },
      ],
    },
    Transactions: { find: jest.fn(() => ({ lean: async () => posted })) },
  } as unknown as IModels);
const signed = (docs: ITransaction[], account: string) =>
  docs.reduce(
    (sum, doc) =>
      sum +
      doc.details.reduce(
        (total, row) =>
          total +
          (row.accountId === account
            ? row.amount * (doc.side === TR_SIDES.DEBIT ? 1 : -1)
            : 0),
        0,
      ),
    0,
  );
const postedLiability: ITransaction[] = [
  {
    date: new Date('2026-01-31T00:00:00'),
    journal: JOURNALS.MAIN,
    side: TR_SIDES.CREDIT,
    details: [
      {
        accountId: 'dtl',
        amount: 10,
        fixedAssetId: 'asset',
        branchId: 'a',
        count: 0,
        unitPrice: 0,
      },
    ],
  },
];

test.each([
  [20, 0, 20, 0, -20],
  [0, 20, 0, -20, 20],
])(
  'deferred tax uses the configured asset/liability and expense accounts',
  async (dta, dtl, expectedDta, expectedDtl, expectedExpense) => {
    const docs = await getFxaDeferredTaxTransactions(fixtures(), adjust, [
      {
        ...detail,
        accumulatedDepreciation: dta * 10,
        taxAccumulatedDepreciation: dtl * 10,
      },
    ]);
    expect(signed(docs, 'dta')).toBe(expectedDta);
    expect(signed(docs, 'dtl')).toBe(expectedDtl);
    expect(signed(docs, 'expense')).toBe(expectedExpense);
    expect(
      docs.reduce(
        (sum, doc) =>
          sum +
          signed([doc], 'dta') +
          signed([doc], 'dtl') +
          signed([doc], 'expense'),
        0,
      ),
    ).toBe(0);
  },
);

test('posts only the change, including a reversal when the sign crosses', async () => {
  const docs = await getFxaDeferredTaxTransactions(
    fixtures(postedLiability),
    adjust,
    [{ ...detail, accumulatedDepreciation: 50, taxAccumulatedDepreciation: 0 }],
  );
  expect(signed(docs, 'dtl')).toBe(10);
  expect(signed(docs, 'dta')).toBe(5);
  expect(signed(docs, 'expense')).toBe(-15);
});

test('fully disposed location clears deferred liability even with zero book depreciation', async () => {
  const docs = await getFxaDeferredTaxTransactions(
    fixtures(postedLiability),
    adjust,
    [detail],
  );
  expect(signed(docs, 'dtl')).toBe(10);
  expect(signed(docs, 'expense')).toBe(-10);
});

test('unchanged balance produces no duplicate journal', async () => {
  expect(
    await getFxaDeferredTaxTransactions(fixtures(postedLiability), adjust, [
      { ...detail, taxAccumulatedDepreciation: 100 },
    ]),
  ).toEqual([]);
});

test('tax balances remain isolated by asset and detail location, including explicit unassigned locations', async () => {
  const row = {
    fixedAssetId: 'asset',
    accountId: 'dta',
    amount: 35,
    count: 0,
    unitPrice: 0,
  };
  const posted: ITransaction[] = [
    {
      date: adjust.date,
      journal: JOURNALS.MAIN,
      side: TR_SIDES.DEBIT,
      branchId: 'a',
      details: [
        row,
        { ...row, fixedAssetId: 'other', amount: 500 },
        { ...row, branchId: 'b', amount: 500 },
        { ...row, departmentId: 'team', amount: 500 },
        { ...row, branchId: '', departmentId: '', amount: 8 },
      ],
    },
    {
      date: adjust.date,
      journal: JOURNALS.MAIN,
      side: TR_SIDES.CREDIT,
      branchId: 'a',
      details: [{ ...row, amount: 5 }],
    },
  ];
  const docs = await getFxaDeferredTaxTransactions(fixtures(posted), adjust, [
    {
      ...detail,
      accumulatedDepreciation: 1000,
      taxAccumulatedDepreciation: 600,
    },
    {
      ...detail,
      branchId: '',
      departmentId: '',
      accumulatedDepreciation: 200,
      taxAccumulatedDepreciation: 0,
    },
  ]);
  const assets = docs
    .flatMap((doc) => doc.details)
    .filter((detail) => detail.accountId === 'dta');
  expect(assets).toEqual([
    expect.objectContaining({ branchId: 'a', amount: 10 }),
    expect.objectContaining({ branchId: '', departmentId: '', amount: 12 }),
  ]);
  expect(signed(docs, 'expense')).toBe(-22);
});

test('posting ignores contradictory legacy cached tax targets', async () => {
  const legacy = {
    ...detail,
    accumulatedDepreciation: 1000,
    taxAccumulatedDepreciation: 600,
    temporaryDifference: 999,
    deferredTaxAsset: 999,
    deferredTaxLiability: 999,
  };
  const docs = await getFxaDeferredTaxTransactions(fixtures(), adjust, [
    legacy,
  ]);
  expect(signed(docs, 'dta')).toBe(40);
  expect(signed(docs, 'dtl')).toBe(0);
  expect(signed(docs, 'expense')).toBe(-40);
});

test('assets in the same posting use their own income tax rates', async () => {
  const totals = {
    ...detail,
    accumulatedDepreciation: 1000,
    taxAccumulatedDepreciation: 600,
  };
  const docs = await getFxaDeferredTaxTransactions(fixtures(), adjust, [
    { ...totals, fixedAssetId: 'first', incomeTaxRate: 10 },
    { ...totals, fixedAssetId: 'second', incomeTaxRate: 20 },
  ]);
  const assets = docs
    .flatMap((doc) => doc.details)
    .filter((row) => row.accountId === 'dta');
  expect(assets).toEqual([
    expect.objectContaining({ fixedAssetId: 'first', amount: 40 }),
    expect.objectContaining({ fixedAssetId: 'second', amount: 80 }),
  ]);
});

test('missing configuration fails before transaction writes', async () => {
  await expect(
    getFxaDeferredTaxTransactions(fixtures([], ''), adjust, [
      {
        ...detail,
        accumulatedDepreciation: 100,
        taxAccumulatedDepreciation: 0,
      },
    ]),
  ).rejects.toThrow('Configure deferred tax');
});

test.each([1000, 0])(
  'posting keeps tax depreciation out of the book ledger when book expense is %s',
  async (bookExpense) => {
    const create = jest.fn(async (docs: ITransaction[]) =>
      docs.map((doc) => ({ ...doc, parentId: 'parent' })),
    );
    const updateMany = jest.fn();
    const snapshot: IAdjustFxaDetail = {
      ...detail,
      depreciationAmount: bookExpense,
      accumulatedDepreciation: 1000,
      taxDepreciationAmount: 600,
      taxAccumulatedDepreciation: 600,
    };
    const models = {
      Configs: {
        getConfigs: async () => [
          {
            subId: 'cost',
            value: {
              depreciationAccountId: 'accumulated',
              taxAssetAccountId: 'dta',
              taxLiabilityAccountId: 'dtl',
              TaxExpenseAccountId: 'expense',
            },
          },
        ],
      },
      Transactions: {
        find: () => ({ lean: async () => [] }),
        createPTransaction: create,
      },
      AdjustFxaDetails: {
        find: () => ({ lean: async () => [snapshot] }),
        updateMany,
      },
      AdjustFixedAssets: {
        updateAdjustFixedAsset: jest.fn(
          async (_id: string, doc: Record<string, unknown>) => doc,
        ),
      },
    } as unknown as IModels;
    await createAdjustFixedAssetTransaction({
      models,
      userId: 'user',
      adjust,
      expenseAccountId: 'book-expense',
    });
    const docs = create.mock.calls[0][0];
    expect(
      signed(
        docs.filter((doc) => doc.journal === JOURNALS.FXA_DEP),
        'book-expense',
      ),
    ).toBe(bookExpense);
    expect(
      signed(
        docs.filter((doc) => doc.journal === JOURNALS.FXA_DEP),
        'accumulated',
      ),
    ).toBeCloseTo(-bookExpense);
    expect(signed(docs, 'dta')).toBe(40);
    expect(signed(docs, 'expense')).toBe(-40);
    expect(
      docs.flatMap((doc) => doc.details).some((row) => row.amount === 600),
    ).toBe(false);
    expect(docs.every((doc) => doc.contentId === adjust._id)).toBe(true);
    expect(updateMany).toHaveBeenCalledWith(
      { adjustId: adjust._id },
      expect.objectContaining({
        $set: expect.objectContaining({ transactionId: 'parent' }),
      }),
    );
  },
);

test.each([
  [80, 120],
  [0, 40],
])(
  'dated capital tax target %s resets accumulation once and keeps period tax expense separate',
  (target, closing) => {
    const corrections = [
      {
        fixedAssetId: 'asset',
        date: new Date('2026-02-01T00:00:00'),
        rules: { taxPreDeprecation: target },
      },
    ];
    expect(calculate({ corrections }).get('a:')?.accumulated).toBeCloseTo(
      closing,
    );
    expect(calculate({ corrections }).get('a:')?.amount).toBeCloseTo(40);
    expect(
      calculate({
        corrections,
        beginDate: new Date('2026-01-01T00:00:00'),
        endDate: new Date('2026-01-31T00:00:00'),
      }).get('a:')?.accumulated,
    ).toBeCloseTo(40);
  },
);
