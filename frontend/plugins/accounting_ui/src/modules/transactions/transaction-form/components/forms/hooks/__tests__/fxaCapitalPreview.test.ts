import {
  buildFxaCapitalPreview,
  mergeFxaDepreciationFollows,
  allocateRevaluationPreview,
  TFxaCapitalValuation,
} from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';
import {
  fxaCapitalDetailDefaultValues,
  JOURNALS_BY_JOURNAL,
} from '@/transactions/transaction-form/contants/defaultValues';
import { transactionFxaCapitalSchema } from '@/transactions/transaction-form/contants/transactionSchema';
import { TrJournalEnum } from '@/transactions/types/constants';
import { getRateFromUsefulLife } from '@/settings/fixed-assets/utils/depreciationRate';

jest.mock('react-i18next', () => ({
  getI18n: () => ({ t: (value: string) => value }),
}));

jest.mock('ui-modules', () => ({ CustomerType: { CUSTOMER: 'customer' } }));

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
  incomeTaxRate: null,
  annualDepreciationRate: 10,
  depreciationMethod: 'straightLine',
  salvageValue: 0,
  depreciationStartDate: '2026-01-01',
  depreciationThrough: '2026-01-31',
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
const journal = () =>
  JOURNALS_BY_JOURNAL(TrJournalEnum.FXA_CAPITAL, {
    _id: 'capital',
    details: [
      {
        _id: 'first',
        fixedAssetId: 'asset',
        accountId: 'asset-account',
        count: 0,
        amount: 0,
        followInfos: {
          originalCost: 150,
          preDeprecation: 120,
          annualDepreciationRate: getRateFromUsefulLife(5),
          depreciationMethod: 'straightLine',
          salvageValue: 0,
        },
      },
    ],
  });

test('preview allocates capitalized cost and depreciation while leaving the difference for ordinary journals', () => {
  const preview = buildFxaCapitalPreview(journal(), valuation);
  expect(preview?.details.map((row) => row.amount)).toEqual([100, 50]);
  expect(preview?.details.every((row) => row.count === 0)).toBe(true);
  expect(
    preview?.follows
      .find((row) => row.journal === TrJournalEnum.FXA_DEP_IN)
      ?.details.map((row) => row.amount),
  ).toEqual([20, 10]);
  expect(
    preview?.follows.reduce(
      (sum, row) => sum + (row.sumDt || 0) - (row.sumCt || 0),
      150,
    ),
  ).toBe(120);
  expect(preview?.follows).toHaveLength(1);
  expect(journal().followInfos).toBeUndefined();
  expect(
    transactionFxaCapitalSchema.shape.followInfos.safeParse(undefined).success,
  ).toBe(true);
  expect(preview?.details[0].followInfos.annualDepreciationRate).toBe(20);
  expect(
    buildFxaCapitalPreview(journal(), valuation)?.details.map((row) => row._id),
  ).toEqual(preview?.details.map((row) => row._id));
});

test('zero accumulated depreciation is retained and produces a depreciation decrease', () => {
  const doc = journal();
  if (doc.journal !== TrJournalEnum.FXA_CAPITAL)
    throw new Error('Invalid test journal');
  doc.details[0].followInfos.preDeprecation = 0;
  const preview = buildFxaCapitalPreview(doc, valuation);
  expect(
    preview?.follows
      .find((row) => row.journal === TrJournalEnum.FXA_DEP_OUT)
      ?.details.map((row) => row.amount),
  ).toEqual([60, 30]);
});

test('capitalization accepts a total above unit cost and leaves quantity-aware bounds to backend', () => {
  const doc = journal();
  if (doc.journal !== TrJournalEnum.FXA_CAPITAL)
    throw new Error('Invalid test journal');
  const detailSchema = transactionFxaCapitalSchema.shape.details.element;
  expect(
    detailSchema.safeParse({
      ...doc.details[0],
      followInfos: {
        ...doc.details[0].followInfos,
        preDeprecation: 160,
      },
    }).success,
  ).toBe(true);
});

test('new locations cannot reuse an existing location detail id', () => {
  const doc = journal();
  if (doc.journal !== TrJournalEnum.FXA_CAPITAL)
    throw new Error('Invalid test journal');
  doc.details[0].branchId = 'b';
  const before = buildFxaCapitalPreview(doc, valuation);
  if (!before) throw new Error('Missing preview');
  const changed = { ...doc, details: before.details };
  const after = buildFxaCapitalPreview(changed, {
    ...valuation,
    count: 4,
    locations: [
      { branchId: 'c', departmentId: '', count: 1 },
      ...valuation.locations,
    ],
  });
  expect(new Set(after?.details.map((row) => row._id)).size).toBe(3);
  for (const row of before.details) {
    expect(
      after?.details.find((next) => next.branchId === row.branchId)?._id,
    ).toBe(row._id);
  }
});

test('batch preview isolates rules and identities for assets at identical locations', () => {
  const doc = journal();
  if (doc.journal !== TrJournalEnum.FXA_CAPITAL)
    throw new Error('Invalid test journal');
  doc.details.push({
    ...doc.details[0],
    _id: 'second',
    fixedAssetId: 'second',
    followInfos: {
      ...doc.details[0].followInfos,
      originalCost: 200,
      annualDepreciationRate: 5,
    },
  });
  const valuations = [valuation, { ...valuation, fixedAssetId: 'second' }];
  const preview = buildFxaCapitalPreview(doc, valuations);
  expect(preview?.mixedDirections).toBe(false);
  expect(preview?.details.map((row) => row.amount)).toEqual([
    100, 50, 200, 100,
  ]);
  expect(preview?.details[2].followInfos.annualDepreciationRate).toBe(5);
  expect(new Set(preview?.details.map((row) => row._id)).size).toBe(4);
  expect(preview?.follows).toHaveLength(1);
  expect(new Set(preview?.follows[0].details.map((row) => row._id)).size).toBe(
    4,
  );
  doc.details = [doc.details[1]];
  expect(
    buildFxaCapitalPreview(doc, valuations)?.details.every(
      (row) => row.fixedAssetId === 'second',
    ),
  ).toBe(true);
});

test('batch preview identifies mixed cost directions without treating zero-cost rules as a decrease', () => {
  const doc = journal();
  if (doc.journal !== TrJournalEnum.FXA_CAPITAL)
    throw new Error('Invalid test journal');
  doc.details.push({
    ...doc.details[0],
    _id: 'second',
    fixedAssetId: 'second',
    followInfos: { ...doc.details[0].followInfos, originalCost: 80 },
  });
  const valuations = [valuation, { ...valuation, fixedAssetId: 'second' }];
  expect(buildFxaCapitalPreview(doc, valuations)?.mixedDirections).toBe(true);
  doc.details[1].followInfos.originalCost = 100;
  expect(buildFxaCapitalPreview(doc, valuations)?.mixedDirections).toBe(false);
});

test('location allocation never reuses another branch label and carries known labels to follows', () => {
  const doc = journal();
  if (doc.journal !== TrJournalEnum.FXA_CAPITAL)
    throw new Error('Invalid test journal');
  doc.details[0].branchId = 'a';
  Object.assign(doc.details[0], {
    branch: { _id: 'a', code: '1000', title: 'First branch' },
  });
  const preview = buildFxaCapitalPreview(doc, valuation);
  expect(preview?.details[0].branch?.title).toBe('First branch');
  expect(preview?.details[1].branchId).toBe('b');
  expect(preview?.details[1].branch).toBeUndefined();
  expect(preview?.follows[0].details[0].branch?.title).toBe('First branch');
  expect(preview?.follows[0].details[1].branchId).toBe('b');
  expect(preview?.follows[0].details[1].branch).toBeUndefined();
});

test.each([
  [-5, 6, 0, 1],
  [-5, 4, 1, 0],
  [5, -6, 1, 0],
  [5, -4, 0, 1],
])(
  'revaluation preview keeps nonnegative loss/reserve after %s then %s',
  (first, second, loss, reserve) => {
    const opening = allocateRevaluationPreview(first, 0, 0);
    expect(
      allocateRevaluationPreview(
        second,
        opening.revaluationLoss,
        opening.revaluationReserve,
      ),
    ).toMatchObject({
      revaluationLoss: Number(loss) - opening.revaluationLoss,
      revaluationReserve: Number(reserve) - opening.revaluationReserve,
    });
  },
);

test('revaluation previews split recovery by location while capital does not record reserve movements', () => {
  const doc = JOURNALS_BY_JOURNAL(TrJournalEnum.FXA_REVALUATION, {
    _id: 'revaluation',
    details: [
      {
        _id: 'first',
        fixedAssetId: 'asset',
        accountId: 'asset-account',
        amount: 0,
        count: 0,
        followInfos: {
          originalCost: 120,
          annualDepreciationRate: 20,
          preDeprecation: 120,
        },
      },
    ],
  });
  const result = buildFxaCapitalPreview(doc, {
    ...valuation,
    revaluationLoss: 15,
  });
  expect(
    result?.details.map((detail) => ({
      revaluationLoss: detail.followInfos?.revaluationLoss,
      revaluationReserve: detail.followInfos?.revaluationReserve,
    })),
  ).toEqual([
    { revaluationLoss: -10, revaluationReserve: 10 },
    { revaluationLoss: -5, revaluationReserve: 5 },
  ]);
  expect(result?.follows[0].originType).toBe('fxaDepIn');
});

test.each([TrJournalEnum.FXA_CAPITAL, TrJournalEnum.FXA_REVALUATION])(
  '%s replaces its saved depreciation preview without duplicates and retains saved row ids',
  (kind) => {
    const doc = { ...journal(), journal: kind };
    const preview = buildFxaCapitalPreview(doc, valuation);
    if (!preview) throw new Error('Missing preview');
    const saved = {
      ...preview.follows[0],
      _id: 'saved-follow',
      details: preview.follows[0].details.map((detail, index) => ({
        ...detail,
        _id: `saved-detail-${index}`,
      })),
    };
    const unrelated = {
      ...saved,
      _id: 'another-follow',
      originId: 'another-source',
    };
    const merged = mergeFxaDepreciationFollows(
      [saved, unrelated],
      preview.follows,
      doc._id,
    );
    expect(merged).toHaveLength(2);
    expect(merged[0]).toBe(unrelated);
    expect(merged[1]._id).toBe('saved-follow');
    expect(merged[1].details.map((detail) => detail._id)).toEqual([
      'saved-detail-0',
      'saved-detail-1',
    ]);
    expect(mergeFxaDepreciationFollows(merged, preview.follows, doc._id)).toBe(
      merged,
    );
  },
);

test.each([TrJournalEnum.FXA_CAPITAL, TrJournalEnum.FXA_REVALUATION])(
  '%s removes stale shared depreciation follows on direction reversal and zero change',
  (kind) => {
    const doc = { ...journal(), journal: kind };
    const original = buildFxaCapitalPreview(doc, valuation);
    if (!original) throw new Error('Missing preview');
    doc.details[0].followInfos.preDeprecation = 0;
    const reversed = buildFxaCapitalPreview(doc, valuation);
    if (!reversed) throw new Error('Missing reversed preview');
    const merged = mergeFxaDepreciationFollows(
      original.follows,
      reversed.follows,
      doc._id,
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].originType).toBe(TrJournalEnum.FXA_DEP_OUT);
    expect(mergeFxaDepreciationFollows(merged, [], doc._id)).toEqual([]);
  },
);

test('new capitalization rows distinguish an uninitialized cost from an explicit zero', () => {
  expect(
    fxaCapitalDetailDefaultValues({ fixedAssetId: 'asset' }).followInfos
      .originalCost,
  ).toBeUndefined();
  const saved = fxaCapitalDetailDefaultValues({
    fixedAssetId: 'asset',
    followInfos: { originalCost: 0 },
  });
  expect(saved.followInfos.originalCost).toBe(0);
  expect(fxaCapitalDetailDefaultValues(saved).followInfos.originalCost).toBe(0);
});

test('capital detail validation requires a loaded cost while accepting an explicit zero target', () => {
  const doc = journal();
  const detail = doc.details[0];
  const schema = transactionFxaCapitalSchema.shape.details.element;
  const missing = {
    ...detail,
    followInfos: { ...detail.followInfos, originalCost: undefined },
  };
  const result = schema.safeParse(missing);
  expect(result.success).toBe(false);
  if (!result.success)
    expect(result.error.issues).toContainEqual(
      expect.objectContaining({ path: ['followInfos', 'originalCost'] }),
    );
  expect(
    schema.safeParse({
      ...missing,
      followInfos: {
        ...missing.followInfos,
        originalCost: 0,
        preDeprecation: 0,
        salvageValue: 0,
      },
    }).success,
  ).toBe(true);
});

const taxAccounts = {
  'asset-account': {
    accountId: 'asset-account',
    taxAssetAccountId: 'tax-asset',
    taxLiabilityAccountId: 'tax-liability',
    TaxExpenseAccountId: 'tax-expense',
    revaluationReserveAccountId: 'reserve',
    revaluationLossAccountId: 'loss',
  },
};
const activeTaxValuation: TFxaCapitalValuation = {
  ...valuation,
  hasTaxDepreciation: true,
  taxPreDeprecation: 30,
  incomeTaxRate: 10,
  locations: valuation.locations.map((row) => ({
    ...row,
    deferredTaxAsset: row.count * 2,
    deferredTaxLiability: 0,
  })),
};
const signedTax = (
  rows: NonNullable<ReturnType<typeof buildFxaCapitalPreview>>['follows'],
  accountId: string,
) =>
  rows.reduce(
    (sum, row) =>
      sum +
      row.details.reduce(
        (value, detail) =>
          detail.accountId === accountId
            ? value + (detail.amount || 0) * (row.side === 'dt' ? 1 : -1)
            : value,
        0,
      ),
    0,
  );

test('capital preview allocates separate tax targets and posts only the change from prior deferred balances', () => {
  const doc = journal();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    preDeprecation: 120,
    taxPreDeprecation: 90,
  };
  const result = buildFxaCapitalPreview(doc, activeTaxValuation, taxAccounts);
  expect(
    result?.details.map((row) => row.followInfos?.taxPreDeprecation),
  ).toEqual([60, 30]);
  const tax =
    result?.follows.filter((row) => row.originType === 'fxaDeferredTax') || [];
  expect(tax).toHaveLength(1);
  expect(tax[0].journal).toBe(TrJournalEnum.FXA_DEFERRED_TAX);
  expect(signedTax(tax, 'tax-asset')).toBe(-3);
  expect(signedTax(tax, 'tax-liability')).toBe(0);
  expect(signedTax(tax, 'tax-expense')).toBe(0);
});

test('blank tax target retains dated tax depreciation while an explicit zero remains zero', () => {
  const doc = journal();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    preDeprecation: 120,
  };
  expect(
    buildFxaCapitalPreview(doc, activeTaxValuation, taxAccounts)?.details.map(
      (row) => row.followInfos?.taxPreDeprecation,
    ),
  ).toEqual([20, 10]);
  doc.details[0].followInfos.taxPreDeprecation = 0;
  const result = buildFxaCapitalPreview(doc, activeTaxValuation, taxAccounts);
  expect(
    result?.details.every((row) => row.followInfos?.taxPreDeprecation === 0),
  ).toBe(true);
  expect(signedTax(result?.follows || [], 'tax-asset')).toBe(6);
});

test('passive capital preview mirrors business depreciation and generates no tax pair', () => {
  const doc = journal();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    preDeprecation: 120,
    taxPreDeprecation: 999,
  };
  const result = buildFxaCapitalPreview(doc, valuation, taxAccounts);
  expect(
    result?.details.map((row) => row.followInfos?.taxPreDeprecation),
  ).toEqual([80, 40]);
  expect(
    result?.follows.some((row) => row.originType === 'fxaDeferredTax'),
  ).toBe(false);
});

test('tax account configuration errors are visible before saving', () => {
  const result = buildFxaCapitalPreview(journal(), activeTaxValuation, {});
  expect(result?.error).toBe('fxa-capital-tax-accounts-required');
});

test('tax preview merging preserves both saved sides and distinct account detail ids at a sign reversal', () => {
  const doc = journal();
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    preDeprecation: 120,
    taxPreDeprecation: 150,
  };
  const follows =
    buildFxaCapitalPreview(
      doc,
      activeTaxValuation,
      taxAccounts,
    )?.follows.filter((row) => row.originType === 'fxaDeferredTax') || [];
  const saved = follows.map((row) => ({
    ...row,
    _id: `saved-${row.side}`,
    details: row.details.map((detail, index) => ({
      ...detail,
      _id: `${row.side}-${index}`,
    })),
  }));
  const merged = mergeFxaDepreciationFollows(saved, follows, doc._id, true);
  expect(merged.map((row) => row._id)).toEqual(['saved-ct']);
  expect(
    new Set(merged.flatMap((row) => row.details.map((detail) => detail._id)))
      .size,
  ).toBe(4);
  expect(signedTax(merged, 'tax-asset')).toBe(-6);
  expect(signedTax(merged, 'tax-liability')).toBe(-3);
  expect(signedTax(merged, 'tax-expense')).toBe(0);
  expect(mergeFxaDepreciationFollows(merged, [], doc._id, true)).toEqual([]);
});

test('revaluation preview preserves the tax difference and balances through reserve/loss without tax rows', () => {
  const doc = journal();
  doc.journal = TrJournalEnum.FXA_REVALUATION;
  doc.details[0].followInfos = {
    ...doc.details[0].followInfos,
    taxPreDeprecation: 60,
  };
  const result = buildFxaCapitalPreview(doc, activeTaxValuation, taxAccounts);
  expect(result?.error).toBeUndefined();
  expect(
    result?.follows.some(
      (tr) => tr.journal === TrJournalEnum.FXA_REVALUATION_RESULT,
    ),
  ).toBe(true);
  expect(
    result?.follows.some((tr) => tr.journal === TrJournalEnum.FXA_DEFERRED_TAX),
  ).toBe(false);
  expect(
    result?.details.map((row) => row.followInfos?.taxPreDeprecation),
  ).toEqual([40, 20]);
  const all = [
    { ...doc, side: result?.side, details: result?.details || [] },
    ...(result?.follows || []),
  ];
  expect(
    all.reduce(
      (sum, tr) =>
        sum +
        (tr.side === 'dt' ? 1 : -1) *
          tr.details.reduce((total, row) => total + (row.amount ?? 0), 0),
      0,
    ),
  ).toBeCloseTo(0);
  expect(signedTax(result?.follows || [], 'reserve')).toBeCloseTo(-120);
  expect(signedTax(result?.follows || [], 'tax-asset')).toBeCloseTo(0);
  expect(signedTax(result?.follows || [], 'tax-expense')).toBeCloseTo(0);
});

test('revaluation missing reserve/loss matching reports a configuration error', () => {
  const doc = journal();
  doc.journal = TrJournalEnum.FXA_REVALUATION;
  expect(buildFxaCapitalPreview(doc, valuation, {})?.error).toBe(
    'fxa-revaluation-accounts-required',
  );
});
