import type { IModels } from '~/connectionResolvers';
import type { ITransaction } from '../../@types/transaction';
import { JOURNALS, TR_SIDES, TR_STATUSES } from '../../@types/constants';
import { getFxaCapitalValuation } from '../fxaCapitalValuation';

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

test('historical valuation excludes future capitalized cost and depreciation', async () => {
  const { models } = fixture();
  const result = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-01-20'),
  );
  expect(result).toMatchObject({
    originalCost: 100,
    preDeprecation: 20,
    count: 2,
  });
});

test('after capitalization valuation uses the effective cost and posted per-unit depreciation', async () => {
  const { models } = fixture();
  const result = await getFxaCapitalValuation(
    models,
    'asset',
    new Date('2026-02-01'),
  );
  expect(result).toMatchObject({
    originalCost: 150,
    preDeprecation: 30,
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
    preDeprecation: 20,
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
    preDeprecation: 20,
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
