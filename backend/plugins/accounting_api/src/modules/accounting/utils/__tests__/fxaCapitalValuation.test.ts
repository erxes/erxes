import type { IModels } from '~/connectionResolvers';
import type { ITransaction } from '../../@types/transaction';
import { JOURNALS, TR_SIDES, TR_STATUSES } from '../../@types/constants';
import { getFxaCapitalValuation } from '../fxaCapitalValuation';
import { getFxaIncomeTaxRates } from '../fxaIncomeTaxRates';

const query = <T>(value: T) => ({
  sort() {
    return this;
  },
  lean: async () => value,
});
const entry = (
  journal: string,
  date: string,
  amount: number,
  count: number,
  parentId?: string,
): ITransaction => ({
  _id: `${journal}-${date}`,
  date: new Date(date),
  journal,
  parentId,
  status: TR_STATUSES.COMPLETE,
  side: [JOURNALS.FXA_INCOME, JOURNALS.FXA_CAPITAL].includes(journal)
    ? TR_SIDES.DEBIT
    : TR_SIDES.CREDIT,
  details: [
    {
      fixedAssetId: 'asset',
      accountId:
        journal === JOURNALS.FXA_DEP_IN ? 'dep-account' : 'asset-account',
      count,
      amount,
      branchId: 'branch',
    },
  ],
});
const fixture = () => {
  const capital = entry(
    JOURNALS.FXA_CAPITAL,
    '2026-02-01',
    100,
    0,
    'capital-parent',
  );
  capital.details[0].followInfos = {
    originalCost: 150,
    annualDepreciationRate: 20,
    depreciationBase: 120,
    depreciationStartDate: new Date('2026-02-01'),
  };
  const entries = [
    entry(JOURNALS.FXA_INCOME, '2026-01-01', 200, 2),
    entry(JOURNALS.FXA_DEP_IN, '2026-01-01', 40, 0),
    capital,
    entry(JOURNALS.FXA_DEP_IN, '2026-02-01', 20, 0, 'capital-parent'),
  ];
  entries[0].details[0].followInfos = {
    depreciationMethod: 'straightLine',
    annualDepreciationRate: 10,
  };
  const selectors: Record<string, unknown>[] = [];
  const raw = {
    FixedAssets: {
      find: () =>
        query([
          {
            _id: 'asset',
            code: 'asset',
            name: 'Asset',
            categoryId: 'category',
          },
        ]),
    },
    Configs: {
      getConfigs: async () => [
        {
          subId: 'asset-account',
          value: { depreciationAccountId: 'dep-account' },
        },
      ],
    },
    AdjustFxaDetails: { find: () => query([]) },
    AdjustFixedAssets: {
      findOne: () => query({ date: new Date('2026-01-31') }),
    },
    Transactions: {
      findOne: ({ _id }: { _id: string }) =>
        query(entries.find((row) => row._id === _id)),
      find: (selector: {
        date: { $lt: Date };
        journal?: { $in: string[] };
        parentId?: { $ne: string };
        _id?: { $ne: string };
      }) => {
        selectors.push(selector);
        return query(
          entries.filter(
            (row) =>
              row.date < selector.date.$lt &&
              (!selector.journal ||
                selector.journal.$in.includes(row.journal)) &&
              (!selector.parentId || row.parentId !== selector.parentId.$ne) &&
              (!selector._id || row._id !== selector._id.$ne),
          ),
        );
      },
    },
  };
  return { models: raw as unknown as IModels, entries, capital, selectors };
};

test('income tax rates stay asset-specific and change only on dated capitalization', async () => {
  const { models, entries, capital } = fixture();
  entries[0].details[0].followInfos = {
    ...entries[0].details[0].followInfos,
    incomeTaxRate: 10,
  };
  capital.details[0].followInfos = {
    ...capital.details[0].followInfos,
    incomeTaxRate: 20,
  };
  const revaluation = entry(JOURNALS.FXA_REVALUATION, '2026-03-01', 0, 0);
  revaluation.details[0].followInfos = { incomeTaxRate: 50 };
  entries.push(revaluation);
  const details = [
    {
      fixedAssetId: 'asset',
      accumulatedDepreciation: 1000,
      taxAccumulatedDepreciation: 600,
    },
  ];
  expect(
    (await getFxaIncomeTaxRates(models, new Date('2026-01-31'), details)).get(
      'asset',
    ),
  ).toBe(10);
  expect(
    (await getFxaIncomeTaxRates(models, new Date('2026-02-01'), details)).get(
      'asset',
    ),
  ).toBe(20);
  expect(
    (await getFxaIncomeTaxRates(models, new Date('2026-03-01'), details)).get(
      'asset',
    ),
  ).toBe(20);
  capital.details[0].followInfos.incomeTaxRate = 0;
  expect(
    (await getFxaIncomeTaxRates(models, new Date('2026-02-01'), details)).get(
      'asset',
    ),
  ).toBe(0);
});

test('rate lookup scopes correction reads and ignores unrelated details in a mixed-asset transaction', async () => {
  const { models, capital, selectors } = fixture();
  capital.details[0].followInfos = {
    ...capital.details[0].followInfos,
    incomeTaxRate: 20,
  };
  capital.details.push({
    ...capital.details[0],
    fixedAssetId: 'unrelated',
    followInfos: { incomeTaxRate: NaN },
  });
  const rates = await getFxaIncomeTaxRates(models, new Date('2026-02-01'), [
    {
      fixedAssetId: 'asset',
      accumulatedDepreciation: 1000,
      taxAccumulatedDepreciation: 600,
    },
  ]);
  expect(rates.get('asset')).toBe(20);
  expect(rates.has('unrelated')).toBe(false);
  expect(selectors).toContainEqual(
    expect.objectContaining({
      journal: { $in: [JOURNALS.FXA_REVALUATION, JOURNALS.FXA_CAPITAL] },
      'details.fixedAssetId': { $in: ['asset'] },
    }),
  );
});

test('historical valuation excludes future capitalized cost and depreciation', async () => {
  const { models } = fixture();
  const result = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-01-20'),
  );
  expect(result).toMatchObject({
    originalCost: 100,
    preDeprecation: 40,
    count: 2,
  });
});

test('after capitalization valuation uses the effective cost and posted total depreciation', async () => {
  const { models } = fixture();
  const result = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-02-01'),
  );
  expect(result).toMatchObject({
    originalCost: 150,
    preDeprecation: 60,
    count: 2,
    ready: true,
    locations: [{ branchId: 'branch', departmentId: '', count: 2 }],
  });
});

test('editing excludes the whole old capitalization workflow and restores its preceding valuation', async () => {
  const { models, capital, selectors } = fixture();
  const result = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-02-01'),
    capital._id,
  );
  expect(result).toMatchObject({
    originalCost: 100,
    preDeprecation: 40,
    count: 2,
  });
  expect(selectors).toContainEqual(
    expect.objectContaining({ parentId: { $ne: 'capital-parent' } }),
  );
});

test('deleting the capital source and its follows restores the old effective rules', async () => {
  const { models, entries } = fixture();
  entries.splice(2);
  const result = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-02-01'),
  );
  expect(result).toMatchObject({
    originalCost: 100,
    preDeprecation: 40,
    annualDepreciationRate: 10,
  });
});

test('an ordinary balancing journal does not change dated asset cost, depreciation or quantity', async () => {
  const { models, entries } = fixture();
  const before = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-02-01'),
  );
  const main = entry(JOURNALS.MAIN, '2026-02-01', 80, 0, 'capital-parent');
  main.details[0].accountId = 'dep-account';
  entries.push(main);
  expect(
    await getFxaCapitalValuation(models, 'asset', new Date('2026-02-01')),
  ).toEqual(before);
});

test('active tax valuation replays acquisition rules through the prior day and exposes opening totals on acquisition day', async () => {
  const { models, entries } = fixture();
  entries[0].details[0].followInfos = {
    ...entries[0].details[0].followInfos,
    hasTaxDepreciation: true,
    taxPreDeprecation: 10,
    taxAnnualDepreciationRate: 12,
    taxDepreciationMethod: 'straightLine',
    incomeTaxRate: 10,
  };
  const acquisition = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-01-01'),
  );
  expect(acquisition.taxPreDeprecation).toBe(10);
  const result = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-02-01'),
  );
  expect(result.hasTaxDepreciation).toBe(true);
  expect(result.taxPreDeprecation).toBeCloseTo(12);
  expect(result.incomeTaxRate).toBe(10);
});

test('tax valuation sums split capital targets once before replaying later tax depreciation', async () => {
  const { models, entries, capital } = fixture();
  entries[0].details[0].followInfos = {
    ...entries[0].details[0].followInfos,
    hasTaxDepreciation: true,
    taxPreDeprecation: 10,
    taxAnnualDepreciationRate: 12,
    taxDepreciationMethod: 'straightLine',
    incomeTaxRate: 10,
  };
  capital.details = [
    {
      ...capital.details[0],
      followInfos: { ...capital.details[0].followInfos, taxPreDeprecation: 20 },
    },
    {
      ...capital.details[0],
      branchId: 'other',
      followInfos: { ...capital.details[0].followInfos, taxPreDeprecation: 10 },
    },
  ];
  const result = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-02-02'),
  );
  expect(result.taxPreDeprecation).toBeCloseTo(30 + 2 / 28);
});
