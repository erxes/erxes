import { IModels } from '~/connectionResolvers';
import { ITransaction, ITransactionDocument } from '../../@types/transaction';
import { JOURNALS, TR_SIDES, TR_FOLLOW_TYPES } from '../../@types/constants';
import {
  buildFxaCapitalDocuments,
  validateFxaCapitalSave,
  validateFxaCapitalRemove,
  saveFxaCapital,
  removeFxaCapital,
} from '../fxaCapital';
import {
  getFxaCapitalValuation,
  TFxaCapitalValuation,
} from '../fxaCapitalValuation';
import { assertCanWriteTransactionAccounts } from '../trPermissions';
import { createOrUpdateTr } from '../utils';

jest.mock('../trPermissions', () => ({
  assertCanWriteTransactionAccounts: jest.fn(),
}));
jest.mock('../utils', () => ({ createOrUpdateTr: jest.fn() }));
jest.mock('../fxaCapitalValuation', () => ({
  getFxaCapitalValuation: jest.fn(),
  fxaCapitalDate: (date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },
}));

const valuation: TFxaCapitalValuation = {
  revaluationLoss: 0,
  revaluationReserve: 0,
  taxDepreciationMethod: 'straightLine',
  taxAnnualDepreciationRate: 20,
  taxSalvageValue: 0,
  fixedAssetId: 'asset',
  accountId: 'asset-account',
  depreciationAccountId: 'dep-account',
  count: 3,
  originalCost: 100,
  preDeprecation: 90,
  taxPreDeprecation: 90,
  hasTaxDepreciation: false,
  incomeTaxRate: undefined,
  annualDepreciationRate: 10,
  depreciationMethod: 'straightLine',
  salvageValue: 0,
  depreciationStartDate: new Date('2026-01-01'),
  depreciationThrough: new Date('2026-01-31'),
  ready: true,
  locations: [
    {
      branchId: 'a',
      departmentId: '',
      count: 2,
      deferredTaxAsset: 0,
      deferredTaxLiability: 0,
    },
    {
      branchId: 'b',
      departmentId: '',
      count: 1,
      deferredTaxAsset: 0,
      deferredTaxLiability: 0,
    },
  ],
};
const document = (): ITransaction => ({
  _id: 'capital',
  journal: JOURNALS.FXA_CAPITAL,
  date: new Date('2026-02-01'),
  side: TR_SIDES.DEBIT,
  details: [
    {
      _id: 'input',
      accountId: 'asset-account',
      fixedAssetId: 'asset',
      count: 0,
      amount: 0,
      followInfos: {
        originalCost: 150,
        annualDepreciationRate: 20,
        preDeprecation: 120,
      },
    },
  ],
});
const query = <T>(value: T) => ({ lean: async () => value });
const fixture = () => {
  const raw = {
    AdjustFixedAssets: { findOne: jest.fn(() => query(null)) },
    Configs: {
      getConfigs: async () => [
        {
          subId: 'asset-account',
          value: {
            taxAssetAccountId: 'tax-asset',
            taxLiabilityAccountId: 'tax-liability',
            TaxExpenseAccountId: 'tax-expense',
            revaluationReserveAccountId: 'reserve',
            revaluationLossAccountId: 'loss',
          },
        },
      ],
    },
    Accounts: {
      find: jest.fn(() =>
        query(
          ['asset-account', 'dep-account'].map((_id, index) => ({
            _id,
            journal: ['fixedAsset', 'fxaFollow'][index],
          })),
        ),
      ),
    },
    Transactions: {
      findOne: jest.fn(() => query<{ _id: string } | null>(null)),
      find: jest.fn<
        ReturnType<typeof query<ITransactionDocument[]>>,
        [Record<string, unknown>?]
      >(() => query<ITransactionDocument[]>([])),
      deleteMany: jest.fn(),
    },
  };
  return { models: raw as unknown as IModels, raw };
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getFxaCapitalValuation).mockResolvedValue(valuation);
});

const signed = (doc: ITransaction): number =>
  doc.details.reduce((sum, row) => sum + row.amount, 0) *
  (doc.side === TR_SIDES.DEBIT ? 1 : -1);

test('renovation writes only asset and depreciation entries for an accountant to balance', () => {
  const { main, follows } = buildFxaCapitalDocuments(document(), valuation);
  expect(main.details.map((row) => row.amount)).toEqual([100, 50]);
  expect(new Set(main.details.map((row) => row._id)).size).toBe(2);
  expect(main.details.every((row) => row.count === 0)).toBe(true);
  expect(main.details[0].followInfos).toMatchObject({
    originalCost: 150,
    preDeprecation: 80,
    depreciationBase: 110,
  });
  expect(
    follows
      .find((row) => row.journal === JOURNALS.FXA_DEP_IN)
      ?.details.map((row) => row.amount),
  ).toEqual([20, 10]);
  expect(follows).toHaveLength(1);
  expect(main.followInfos).toBeUndefined();
  expect([main, ...follows].reduce((sum, row) => sum + signed(row), 0)).toBe(
    120,
  );
  expect(document().details[0].followInfos?.originalCost).toBe(150);
});

test('downward revaluation with zero depreciation leaves its net difference for an ordinary root', () => {
  const doc = document();
  doc.details[0].followInfos = {
    originalCost: 80,
    annualDepreciationRate: 25,
    preDeprecation: 0,
  };
  const { main, follows } = buildFxaCapitalDocuments(doc, valuation);
  expect(main.side).toBe(TR_SIDES.CREDIT);
  expect(
    follows
      .find((row) => row.journal === JOURNALS.FXA_DEP_OUT)
      ?.details.map((row) => row.amount),
  ).toEqual([60, 30]);
  expect(main.details[0].followInfos).toMatchObject({
    preDeprecation: 0,
    depreciationBase: 80,
  });
  expect(follows).toHaveLength(1);
  expect([main, ...follows].reduce((sum, row) => sum + signed(row), 0)).toBe(
    30,
  );
});

test('rule-only renewal requires no financial follow rows', () => {
  const doc = document();
  doc.details[0].followInfos = {
    originalCost: 100,
    preDeprecation: 90,
    annualDepreciationRate: 20,
  };
  const result = buildFxaCapitalDocuments(doc, valuation);
  expect(result.main.details.every((row) => row.amount === 0)).toBe(true);
  expect(result.follows).toEqual([]);
});

test('new accumulated depreciation and residual value cannot exceed the new cost', () => {
  const doc = document();
  doc.details[0].followInfos = {
    originalCost: 50,
    annualDepreciationRate: 20,
    preDeprecation: 135,
    salvageValue: 10,
  };
  expect(() => buildFxaCapitalDocuments(doc, valuation)).toThrow(
    'cannot exceed',
  );
});

test('capitalization requires a prior depreciation cutoff and all generated account permissions', async () => {
  const { models } = fixture();
  jest
    .mocked(getFxaCapitalValuation)
    .mockResolvedValueOnce({ ...valuation, ready: false });
  await expect(
    validateFxaCapitalSave('tenant', models, 'user', document()),
  ).rejects.toThrow('day before');
  expect(assertCanWriteTransactionAccounts).not.toHaveBeenCalled();
  await validateFxaCapitalSave('tenant', models, 'user', document());
  expect(assertCanWriteTransactionAccounts).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: 'user',
      docs: expect.arrayContaining([
        expect.objectContaining({ journal: JOURNALS.FXA_DEP_IN }),
      ]),
    }),
  );
});

test('deleting a capital event is blocked while a later event depends on it', async () => {
  const { models, raw } = fixture();
  raw.Transactions.findOne
    .mockReturnValueOnce(query(null))
    .mockReturnValueOnce(query({ _id: 'later' }));
  await expect(
    validateFxaCapitalRemove(
      models,
      'tenant',
      document() as ITransactionDocument,
    ),
  ).rejects.toThrow('later asset changes');
});

test('saving and removing own generated rows keeps source identity and pointer linkage', async () => {
  const { models, raw } = fixture();
  jest.mocked(createOrUpdateTr).mockImplementation(
    async (_models, _user, doc) =>
      ({
        ...doc,
        _id: doc._id || doc.originType,
        parentId: 'parent',
        ptrId: 'pointer',
      } as ITransactionDocument),
  );
  const result = await saveFxaCapital('tenant', models, 'user', document());
  expect(result.otherTrs).toHaveLength(1);
  expect(createOrUpdateTr).toHaveBeenCalledWith(
    models,
    'user',
    expect.objectContaining({
      originId: 'capital',
      parentId: 'parent',
      ptrId: 'pointer',
      journal: JOURNALS.FXA_DEP_IN,
    }),
    undefined,
  );
  await removeFxaCapital(models, 'tenant', result.mainTr);
  expect(raw.Transactions.deleteMany).toHaveBeenCalledWith(
    expect.objectContaining({ originId: 'capital' }),
  );
});

test('every generated journal and origin type is accepted by the transaction schema enums', () => {
  const { main, follows } = buildFxaCapitalDocuments(document(), valuation);
  expect(JOURNALS.ALL).toEqual(
    expect.arrayContaining([
      main.journal,
      ...follows.map((row) => row.journal),
    ]),
  );
  expect(TR_FOLLOW_TYPES.ALL).toEqual(
    expect.arrayContaining(follows.map((row) => row.originType)),
  );
});

test('editing removes obsolete depreciation follows', async () => {
  const { models, raw } = fixture();
  jest.mocked(createOrUpdateTr).mockImplementation(
    async (_models, _user, doc, old) =>
      ({
        ...doc,
        _id: old?._id || doc._id || doc.originType,
        parentId: 'parent',
        ptrId: 'pointer',
      } as ITransactionDocument),
  );
  const first = await saveFxaCapital('tenant', models, 'user', document());
  raw.Transactions.find.mockReturnValue(query(first.otherTrs));
  const changed = {
    ...first.mainTr,
    details: first.mainTr.details.map((row) => ({
      ...row,
      followInfos: {
        ...row.followInfos,
        preDeprecation: row.branchId === 'a' ? 40 : 20,
      },
    })),
  };
  const second = await saveFxaCapital(
    'tenant',
    models,
    'user',
    changed,
    first.mainTr,
  );
  expect(second.otherTrs).toHaveLength(1);
  expect(
    second.otherTrs.some((row) => row.journal === JOURNALS.FXA_DEP_OUT),
  ).toBe(true);
  expect(raw.Transactions.deleteMany).toHaveBeenCalledWith({
    _id: { $in: ['fxaDepIn'] },
  });
});

test('ordinary roots can close the combined difference of several capitalizations without asset linkage', () => {
  const first = buildFxaCapitalDocuments(document(), valuation);
  const other = document();
  other._id = 'second-capital';
  other.details[0].fixedAssetId = 'second-asset';
  other.details[0].followInfos = {
    originalCost: 80,
    preDeprecation: 0,
    annualDepreciationRate: 25,
  };
  const second = buildFxaCapitalDocuments(other, {
    ...valuation,
    fixedAssetId: 'second-asset',
  });
  const root: ITransaction = {
    date: document().date,
    journal: JOURNALS.MAIN,
    side: TR_SIDES.CREDIT,
    details: [
      { accountId: 'manually-selected-account', amount: 150, count: 0 },
    ],
  };
  expect(
    [first.main, ...first.follows, second.main, ...second.follows, root].reduce(
      (sum, row) => sum + signed(row),
      0,
    ),
  ).toBe(0);
  expect(root.details[0].fixedAssetId).toBeUndefined();
});

test('obsolete source-level counterpart input is discarded rather than generating a transaction', () => {
  const doc = document();
  doc.followInfos = { capitalAccountId: 'old-account' };
  const result = buildFxaCapitalDocuments(doc, valuation);
  expect(result.main.followInfos).toBeUndefined();
  expect(result.follows.map((row) => row.journal)).toEqual([
    JOURNALS.FXA_DEP_IN,
  ]);
});

test('batch capitalization keeps independent asset rules and merges depreciation by direction', () => {
  const doc = document();
  doc.details.push({
    ...doc.details[0],
    _id: 'second',
    fixedAssetId: 'second',
    followInfos: {
      ...doc.details[0].followInfos,
      originalCost: 200,
      preDeprecation: 0,
      annualDepreciationRate: 5,
    },
  });
  const second = { ...valuation, fixedAssetId: 'second' };
  const result = buildFxaCapitalDocuments(doc, [valuation, second]);
  expect(result.main.details.map((row) => row.amount)).toEqual([
    100, 50, 200, 100,
  ]);
  expect(result.main.details.map((row) => row.fixedAssetId)).toEqual([
    'asset',
    'asset',
    'second',
    'second',
  ]);
  expect(result.main.details[2].followInfos?.annualDepreciationRate).toBe(5);
  expect(result.follows.map((row) => row.side)).toEqual([
    TR_SIDES.CREDIT,
    TR_SIDES.DEBIT,
  ]);
  doc.details[1].followInfos = {
    ...doc.details[1].followInfos,
    preDeprecation: 120,
  };
  const merged = buildFxaCapitalDocuments(doc, [valuation, second]);
  expect(merged.follows).toHaveLength(1);
  expect(merged.follows[0].details.map((row) => row.fixedAssetId)).toEqual([
    'asset',
    'asset',
    'second',
    'second',
  ]);
});

test('batch rejects opposite cost directions and allows a zero-cost renewal alongside an increase', () => {
  const doc = document();
  doc.details.push({
    ...doc.details[0],
    _id: 'second',
    fixedAssetId: 'second',
    followInfos: { ...doc.details[0].followInfos, originalCost: 80 },
  });
  const second = { ...valuation, fixedAssetId: 'second' };
  expect(() => buildFxaCapitalDocuments(doc, [valuation, second])).toThrow(
    'Separate cost increases',
  );
  doc.details[1].followInfos = {
    ...doc.details[1].followInfos,
    originalCost: 100,
  };
  const result = buildFxaCapitalDocuments(doc, [valuation, second]);
  expect(result.main.side).toBe(TR_SIDES.DEBIT);
  expect(result.main.details.map((row) => row.amount)).toEqual([100, 50, 0, 0]);
});

test('batch edits preserve depreciation row ids by asset and location', async () => {
  const { models, raw } = fixture();
  const doc = document();
  doc.details.push({
    ...doc.details[0],
    _id: 'second',
    fixedAssetId: 'second',
  });
  jest
    .mocked(getFxaCapitalValuation)
    .mockImplementation(async (_models, id) => ({
      ...valuation,
      fixedAssetId: id,
    }));
  jest.mocked(createOrUpdateTr).mockImplementation(
    async (_models, _user, input, old) =>
      ({
        ...input,
        _id: old?._id || input._id || input.originType,
        parentId: 'parent',
        ptrId: 'pointer',
        details: input.details.map((row, i) => ({
          ...row,
          _id: row._id || `saved-${row.fixedAssetId}-${i}`,
        })),
      } as ITransactionDocument),
  );
  const first = await saveFxaCapital('tenant', models, 'user', doc);
  raw.Transactions.find.mockReturnValue(query(first.otherTrs));
  const second = await saveFxaCapital(
    'tenant',
    models,
    'user',
    first.mainTr,
    first.mainTr,
  );
  expect(second.otherTrs[0].details.map((row) => row._id)).toEqual(
    first.otherTrs[0].details.map((row) => row._id),
  );
  expect(new Set(second.otherTrs[0].details.map((row) => row._id)).size).toBe(
    4,
  );
  const reduced = {
    ...first.mainTr,
    details: first.mainTr.details.filter((row) => row.fixedAssetId === 'asset'),
  };
  await validateFxaCapitalSave('tenant', models, 'user', reduced, first.mainTr);
  expect(raw.Transactions.findOne).toHaveBeenLastCalledWith(
    expect.objectContaining({
      'details.fixedAssetId': { $in: ['asset', 'second'] },
    }),
  );
  await validateFxaCapitalRemove(models, 'tenant', first.mainTr);
  expect(raw.Transactions.findOne).toHaveBeenLastCalledWith(
    expect.objectContaining({
      'details.fixedAssetId': { $in: ['asset', 'second'] },
    }),
  );
});

test.each(['fixedAsset', 'fxaFollow'])(
  'capitalization accepts the configured depreciation account in %s',
  async (journal) => {
    const { models, raw } = fixture();
    raw.Accounts.find.mockReturnValue(
      query([
        { _id: 'asset-account', journal: 'fixedAsset' },
        { _id: 'dep-account', journal },
      ]),
    );
    await expect(
      validateFxaCapitalSave('tenant', models, 'user', document()),
    ).resolves.toBeUndefined();
  },
);

test('capitalization still rejects an unrelated main depreciation account', async () => {
  const { models, raw } = fixture();
  raw.Accounts.find.mockReturnValue(
    query([
      { _id: 'asset-account', journal: 'fixedAsset' },
      { _id: 'dep-account', journal: 'main' },
    ]),
  );
  await expect(
    validateFxaCapitalSave('tenant', models, 'user', document()),
  ).rejects.toThrow('journal accounts');
});

const taxValuation: TFxaCapitalValuation = {
  ...valuation,
  hasTaxDepreciation: true,
  taxPreDeprecation: 30,
  incomeTaxRate: 10,
};

test('capitalization reuses total tax depreciation independently and allocates once by location quantity', () => {
  const doc = document();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    taxPreDeprecation: 90,
  };
  const { main, follows } = buildFxaCapitalDocuments(doc, taxValuation);
  expect(main.details.map((row) => row.followInfos?.preDeprecation)).toEqual([
    80, 40,
  ]);
  expect(main.details.map((row) => row.followInfos?.taxPreDeprecation)).toEqual(
    [60, 30],
  );
  expect(
    main.details.every((row) => row.followInfos?.incomeTaxRate === 10),
  ).toBe(true);
  expect(follows).toHaveLength(1);
});

test('passive assets mirror changed book totals despite hidden tax inputs', () => {
  const doc = document();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    taxPreDeprecation: 10000,
  };
  const { main } = buildFxaCapitalDocuments(doc, valuation);
  expect(main.details.map((row) => row.followInfos?.taxPreDeprecation)).toEqual(
    [80, 40],
  );
});

test('explicit zero tax accumulated depreciation survives capitalization', () => {
  const doc = document();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    taxPreDeprecation: 0,
  };
  expect(
    buildFxaCapitalDocuments(doc, taxValuation).main.details.every(
      (row) => row.followInfos?.taxPreDeprecation === 0,
    ),
  ).toBe(true);
});

test('tax depreciation must stay within its acquisition base and a difference requires an income tax percentage', () => {
  const doc = document();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    taxPreDeprecation: 500,
  };
  expect(() => buildFxaCapitalDocuments(doc, taxValuation)).toThrow(
    'shared asset cost',
  );
  doc.details[0].followInfos.taxPreDeprecation = 90;
  expect(() =>
    buildFxaCapitalDocuments(doc, {
      ...taxValuation,
      incomeTaxRate: undefined,
    }),
  ).toThrow('income tax rate');
});

test('capitalization tax posts the balance change and keeps debit/credit follows distinct on edit', async () => {
  const { models, raw } = fixture();
  jest.mocked(getFxaCapitalValuation).mockResolvedValue(taxValuation);
  const doc = document();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    taxPreDeprecation: 90,
  };
  const posted = {
    _id: 'opening',
    journal: JOURNALS.MAIN,
    date: new Date('2026-01-01'),
    side: TR_SIDES.DEBIT,
    details: [
      {
        fixedAssetId: 'asset',
        accountId: 'tax-asset',
        branchId: 'a',
        departmentId: '',
        amount: 4,
      },
      {
        fixedAssetId: 'asset',
        accountId: 'tax-asset',
        branchId: 'b',
        departmentId: '',
        amount: 2,
      },
    ],
  } as ITransactionDocument;
  const oldTaxDebit = {
    ...posted,
    _id: 'own-dt',
    originId: 'capital',
    originType: TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
    details: [
      {
        _id: 'expense-a',
        fixedAssetId: 'asset',
        accountId: 'tax-expense',
        branchId: 'a',
        departmentId: '',
        amount: 2,
      },
      {
        _id: 'expense-b',
        fixedAssetId: 'asset',
        accountId: 'tax-expense',
        branchId: 'b',
        departmentId: '',
        amount: 1,
      },
    ],
  } as ITransactionDocument;
  const oldTaxCredit = {
    ...posted,
    _id: 'own-ct',
    side: TR_SIDES.CREDIT,
    originId: 'capital',
    originType: TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
    details: [
      {
        _id: 'asset-a',
        fixedAssetId: 'asset',
        accountId: 'tax-asset',
        branchId: 'a',
        departmentId: '',
        amount: 2,
      },
      {
        _id: 'asset-b',
        fixedAssetId: 'asset',
        accountId: 'tax-asset',
        branchId: 'b',
        departmentId: '',
        amount: 1,
      },
    ],
  } as ITransactionDocument;
  raw.Transactions.find.mockImplementation((filter) =>
    query(filter?.originId ? [oldTaxDebit, oldTaxCredit] : [posted]),
  );
  jest.mocked(createOrUpdateTr).mockImplementation(
    async (_models, _user, next, old) =>
      ({
        ...next,
        _id: old?._id || next._id || `${next.originType}-${next.side}`,
        parentId: 'parent',
        ptrId: 'pointer',
      } as ITransactionDocument),
  );
  const result = await saveFxaCapital('tenant', models, 'user', doc, {
    ...doc,
    _id: 'capital',
  } as ITransactionDocument);
  const tax = result.otherTrs.filter(
    (row) => row.originType === TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
  );
  expect(tax.map((row) => row._id)).toEqual(['own-ct']);
  expect(tax[0].details.map((row) => row.amount)).toEqual([2, 1]);
  expect(tax[0].details.map((row) => row.accountId)).toEqual([
    'tax-asset',
    'tax-asset',
  ]);
  expect(
    tax[0].details
      .filter((row) => row.accountId === 'tax-asset')
      .map((row) => row._id),
  ).toEqual(['asset-a', 'asset-b']);
  expect(raw.Transactions.deleteMany).toHaveBeenCalledWith({
    _id: { $in: ['own-dt'] },
  });
  expect(
    tax.every((row) => row.ptrId === 'pointer' && row.parentId === 'parent'),
  ).toBe(true);
  expect(raw.Transactions.find).toHaveBeenCalledWith(
    expect.objectContaining({
      $nor: [
        { originId: 'capital', originType: TR_FOLLOW_TYPES.FXA_DEFERRED_TAX },
      ],
    }),
  );
});

test('revaluation preserves the existing depreciation difference and income tax rate', () => {
  const doc = document();
  doc.journal = JOURNALS.FXA_REVALUATION;
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    annualDepreciationRate: valuation.annualDepreciationRate,
  };
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    taxPreDeprecation: 60,
    incomeTaxRate: 10,
  };
  const { main, follows } = buildFxaCapitalDocuments(doc, taxValuation);
  expect(
    main.details.every(
      (row) =>
        row.followInfos?.taxPreDeprecation !== undefined &&
        row.followInfos?.incomeTaxRate === 10,
    ),
  ).toBe(true);
  expect(
    follows.every((row) => row.originType !== TR_FOLLOW_TYPES.FXA_DEFERRED_TAX),
  ).toBe(true);
});

test('revaluation balances reserve/loss without changing existing deferred tax', async () => {
  const { models, raw } = fixture();
  jest.mocked(getFxaCapitalValuation).mockResolvedValue(taxValuation);
  const doc = document();
  doc.journal = JOURNALS.FXA_REVALUATION;
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    annualDepreciationRate: valuation.annualDepreciationRate,
  };
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    taxPreDeprecation: 60,
    taxAnnualDepreciationRate: 20,
    incomeTaxRate: 10,
  };
  raw.Transactions.find.mockImplementation(() =>
    query([
      {
        _id: 'opening-tax',
        date: new Date('2026-01-01'),
        journal: JOURNALS.MAIN,
        side: TR_SIDES.DEBIT,
        details: [
          {
            fixedAssetId: 'asset',
            accountId: 'tax-asset',
            branchId: 'a',
            departmentId: '',
            amount: 4,
          },
          {
            fixedAssetId: 'asset',
            accountId: 'tax-asset',
            branchId: 'b',
            departmentId: '',
            amount: 2,
          },
        ],
      } as ITransactionDocument,
    ]),
  );
  jest.mocked(createOrUpdateTr).mockImplementation(
    async (_models, _user, next) =>
      ({
        ...next,
        _id: next._id || `${next.originType}-${next.side}`,
        parentId: 'parent',
        ptrId: 'pointer',
      } as ITransactionDocument),
  );
  const result = await saveFxaCapital('tenant', models, 'user', doc);
  const all = [result.mainTr, ...result.otherTrs];
  expect(
    all.reduce(
      (sum, tr) =>
        sum +
        (tr.side === TR_SIDES.DEBIT ? 1 : -1) *
          tr.details.reduce((total, row) => total + row.amount, 0),
      0,
    ),
  ).toBeCloseTo(0);
  const signed = (accountId: string) =>
    all.reduce(
      (sum, tr) =>
        sum +
        (tr.side === TR_SIDES.DEBIT ? 1 : -1) *
          tr.details
            .filter((row) => row.accountId === accountId)
            .reduce((total, row) => total + row.amount, 0),
      0,
    );
  expect(signed('reserve')).toBeCloseTo(-120);
  expect(signed('tax-asset')).toBeCloseTo(0);
  expect(
    result.otherTrs.some((row) => row.journal === JOURNALS.FXA_DEFERRED_TAX),
  ).toBe(false);
  expect(signed('tax-expense')).toBeCloseTo(0);
  expect(
    result.mainTr.details.every(
      (row) => row.followInfos?.taxAnnualDepreciationRate === 20,
    ),
  ).toBe(true);
});

test('missing revaluation matching fails before any source or follow writes', async () => {
  const { models, raw } = fixture();
  raw.Configs.getConfigs = async () => [];
  const doc = document();
  doc.journal = JOURNALS.FXA_REVALUATION;
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    annualDepreciationRate: valuation.annualDepreciationRate,
  };
  await expect(saveFxaCapital('tenant', models, 'user', doc)).rejects.toThrow(
    'Configure revaluation reserve/loss accounts',
  );
  expect(createOrUpdateTr).not.toHaveBeenCalled();
});

test.each([
  ['annualDepreciationRate', 25],
  ['depreciationMethod', 'decliningBalance'],
  ['salvageValue', 1],
  ['taxAnnualDepreciationRate', 25],
  ['taxSalvageValue', 1],
  ['incomeTaxRate', 20],
])(
  'revaluation rejects changed %s instead of silently changing dated rules',
  (field, value) => {
    const doc = document();
    doc.journal = JOURNALS.FXA_REVALUATION;
    doc.details[0].followInfos = {
      originalCost: 150,
      preDeprecation: 120,
      [field]: value,
    };
    expect(() => buildFxaCapitalDocuments(doc, taxValuation)).toThrow();
  },
);

test('revaluation derives tax depreciation from the book delta and rejects an independent target', () => {
  const doc = document();
  doc.journal = JOURNALS.FXA_REVALUATION;
  doc.details[0].followInfos = { originalCost: 150, preDeprecation: 120 };
  const { main } = buildFxaCapitalDocuments(doc, taxValuation);
  expect(main.details.map((row) => row.followInfos?.taxPreDeprecation)).toEqual(
    [40, 20],
  );
  expect(
    main.details.reduce(
      (sum, row) =>
        sum +
        (row.followInfos?.preDeprecation ?? 0) -
        (row.followInfos?.taxPreDeprecation ?? 0),
      0,
    ),
  ).toBe(60);
  doc.details[0].followInfos.taxPreDeprecation = 90;
  expect(() => buildFxaCapitalDocuments(doc, taxValuation)).toThrow('preserve');
});
