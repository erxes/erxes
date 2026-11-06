import type { IModels } from '~/connectionResolvers';
import type { ITransaction } from '../../@types/transaction';
import type { IAdjustFxaDetail } from '../../@types/adjustFixedAsset';
import { ADJ_FXA_STATUSES } from '../../@types/adjustFixedAsset';
import { JOURNALS, TR_SIDES, TR_STATUSES } from '../../@types/constants';
import { runAdjustFixedAsset } from '../adjustFixedAssets';

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
  side = TR_SIDES.CREDIT,
  count = 1,
  branchId = 'branch-a',
): ITransaction => ({
  _id: `${journal}-${date}-${branchId}-${side}`,
  journal,
  date: new Date(date),
  status: TR_STATUSES.COMPLETE,
  side,
  branchId,
  details: [
    {
      _id: 'detail',
      fixedAssetId: 'asset-a',
      accountId: 'dep-account',
      amount,
      count,
    },
  ],
});

const setup = ({
  transactions,
  priorDepreciation,
  method = 'straightLine',
  salvageValue = 0,
  acquisitionDate = '2026-01-01',
  snapshotHasAsset = true,
}: {
  transactions: ITransaction[];
  priorDepreciation?: number;
  method?: string;
  salvageValue?: number;
  acquisitionDate?: string;
  snapshotHasAsset?: boolean;
}) => {
  for (const transaction of transactions) {
    if (transaction.journal !== JOURNALS.FXA_INCOME) continue;
    for (const detail of transaction.details) {
      detail.accountId = 'asset-account';
      detail.followInfos = {
        depreciationMethod: method,
        annualDepreciationRate: 12,
        salvageValue,
        depreciationStartDate: new Date(acquisitionDate),
      };
    }
  }
  let savedDetails: IAdjustFxaDetail[] = [];
  const selectors: Record<string, unknown>[] = [];
  const beforeAdjust = {
    _id: 'previous',
    date: new Date('2026-01-01'),
    status: ADJ_FXA_STATUSES.PUBLISH,
  };
  if (priorDepreciation !== undefined && snapshotHasAsset) {
    const existingPosted = transactions
      .filter(
        (transaction) =>
          transaction.date <= beforeAdjust.date &&
          [
            JOURNALS.FXA_DEP,
            JOURNALS.FXA_DEP_IN,
            JOURNALS.FXA_DEP_OUT,
            JOURNALS.FXA_JUSTIFY,
          ].includes(transaction.journal),
      )
      .reduce(
        (sum, transaction) =>
          sum +
          transaction.details
            .filter((detail) => detail.accountId === 'dep-account')
            .reduce(
              (total, detail) =>
                total +
                detail.amount * (transaction.side === TR_SIDES.CREDIT ? 1 : -1),
              0,
            ),
        0,
      );
    const delta = priorDepreciation - existingPosted;
    if (delta) {
      const posted = entry(
        JOURNALS.FXA_DEP,
        '2026-01-01',
        Math.abs(delta),
        delta > 0 ? TR_SIDES.CREDIT : TR_SIDES.DEBIT,
        0,
      );
      posted.contentId = 'previous';
      transactions.push(posted);
    }
  }
  const models = {
    Configs: {
      getConfigs: async () => [
        {
          subId: 'asset-account',
          value: { depreciationAccountId: 'dep-account' },
        },
      ],
    },
    FixedAssets: {
      find: () =>
        query([
          {
            _id: 'asset-a',
            code: 'asset',
            name: 'Asset',
            categoryId: 'category',
          },
        ]),
    },
    Transactions: {
      findOne: (selector: { journal?: string }) =>
        query(
          selector.journal === JOURNALS.FXA_INCOME
            ? transactions.find((tr) => tr.journal === JOURNALS.FXA_INCOME)
            : null,
        ),
      find: (selector: {
        journal: { $in: string[] };
        date: { $lt: Date };
        contentId?: { $ne: string };
      }) => {
        selectors.push(selector);
        return query(
          transactions.filter(
            (tr) =>
              selector.journal.$in.includes(tr.journal || '') &&
              tr.date < selector.date.$lt &&
              (!selector.contentId ||
                tr.contentId !== selector.contentId.$ne) &&
              tr.status === TR_STATUSES.COMPLETE,
          ),
        );
      },
    },
    AdjustFixedAssets: {
      findOne: (selector: {
        date?: { $lt?: Date };
        status?: { $in?: string[] };
      }) =>
        query(
          priorDepreciation !== undefined &&
            selector.date?.$lt &&
            selector.status?.$in
            ? beforeAdjust
            : null,
        ),
      updateAdjustFixedAsset: async (
        _id: string,
        doc: Record<string, unknown>,
      ) => doc,
    },
    AdjustFxaDetails: {
      find: () => {
        throw new Error(
          'Adjustment result caches must not supply financial input.',
        );
      },
      replaceAdjustFxaDetails: async ({
        details,
      }: {
        details: IAdjustFxaDetail[];
      }) => {
        savedDetails = details;
      },
    },
  };
  return {
    selectors,
    run: async (date = '2026-01-02') => {
      // The fixture implements only the model surface used by this calculation.
      await runAdjustFixedAsset(models as unknown as IModels, 'user', {
        _id: 'adjust',
        date: new Date(date),
        status: ADJ_FXA_STATUSES.DRAFT,
        createdAt: new Date(),
        createdBy: 'user',
      } as Parameters<typeof runAdjustFixedAsset>[2]);
      return savedDetails;
    },
  };
};

test.each([
  'straightLine',
  'sumOfYearsDigits',
  'decliningBalance',
  'doubleDecliningBalance',
])(
  '%s carries income opening depreciation into the first adjustment',
  async (method) => {
    const fixture = setup({
      method,
      transactions: [
        entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
        entry(JOURNALS.FXA_DEP_IN, '2025-12-31', 20),
      ],
    });
    const [detail] = await fixture.run('2026-01-01');
    const daily =
      method === 'straightLine'
        ? 1 / 31
        : method === 'sumOfYearsDigits'
        ? 200 / 3001
        : (80 * 0.12 * (method === 'doubleDecliningBalance' ? 2 : 1)) / 365;
    expect(detail.preDeprecation).toBe(20);
    expect(detail.depreciationAmount).toBeCloseTo(daily, 8);
    expect(detail.closingAccumulatedDepreciation).toBeCloseTo(20 + daily, 8);
    expect(detail.closingBookValue).toBeCloseTo(80 - daily, 8);
  },
);

test('opening depreciation caps a straight-line day at salvage value', async () => {
  const fixture = setup({
    salvageValue: 80,
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
      entry(JOURNALS.FXA_DEP_IN, '2025-12-31', 19.999),
    ],
  });
  const [detail] = await fixture.run();
  expect(detail.depreciationAmount).toBeCloseTo(0.001, 8);
  expect(detail.closingBookValue).toBeCloseTo(80, 8);
});

test('uses previous posted depreciation once and applies subsequent credit/debit entries by day', async () => {
  const expense = entry(JOURNALS.FXA_DEP, '2026-01-02', 10, TR_SIDES.DEBIT);
  expense.details[0].accountId = 'expense-account';
  const own = entry(JOURNALS.FXA_DEP, '2026-01-02', 70);
  own.contentId = 'adjust';
  const fixture = setup({
    priorDepreciation: 20,
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
      entry(JOURNALS.FXA_DEP_IN, '2025-12-31', 20),
      entry(JOURNALS.FXA_DEP, '2026-01-02T15:00:00Z', 10),
      expense,
      own,
      entry(JOURNALS.FXA_DEP_OUT, '2026-01-03', 5, TR_SIDES.DEBIT),
    ],
  });
  const [detail] = await fixture.run('2026-01-03');
  expect(detail.preDeprecation).toBe(20);
  expect(detail.closingAccumulatedDepreciation).toBeCloseTo(25 + 2 / 31, 8);
  expect(fixture.selectors).toContainEqual(
    expect.objectContaining({
      contentId: { $ne: 'adjust' },
      date: { $lt: new Date('2026-01-04T00:00:00') },
    }),
  );
});

test('a disposal debit removes the disposed unit depreciation exactly once', async () => {
  const fixture = setup({
    priorDepreciation: 40,
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 200, TR_SIDES.DEBIT, 2),
      entry(JOURNALS.FXA_OUT, '2026-01-03', 100, TR_SIDES.CREDIT),
      entry(JOURNALS.FXA_DEP_OUT, '2026-01-03', 20 + 1 / 31, TR_SIDES.DEBIT),
    ],
  });
  const [detail] = await fixture.run('2026-01-03');
  expect(detail.depreciationAmount).toBeCloseTo(3 / 31, 8);
  expect(detail.closingAccumulatedDepreciation).toBeCloseTo(20 + 2 / 31, 8);
  expect(detail.originalCost).toBe(100);
});

test('a full internal move does not duplicate closing depreciation at the old location', async () => {
  const fixture = setup({
    priorDepreciation: 20,
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
      entry(JOURNALS.FXA_MOVE, '2026-01-03', 100, TR_SIDES.CREDIT),
      entry(
        JOURNALS.FXA_MOVE_IN,
        '2026-01-03',
        100,
        TR_SIDES.DEBIT,
        1,
        'branch-b',
      ),
      entry(JOURNALS.FXA_DEP_OUT, '2026-01-03', 20, TR_SIDES.DEBIT),
      entry(
        JOURNALS.FXA_DEP_IN,
        '2026-01-03',
        20,
        TR_SIDES.CREDIT,
        1,
        'branch-b',
      ),
    ],
  });
  const details = await fixture.run('2026-01-03');
  expect(
    details.find((detail) => detail.branchId === 'branch-a'),
  ).toMatchObject({
    closingAccumulatedDepreciation: 0,
    closingBookValue: 0,
  });
  expect(
    details.reduce(
      (sum, detail) => sum + (detail.closingAccumulatedDepreciation || 0),
      0,
    ),
  ).toBeCloseTo(20 + 2 / 31, 8);
});

test('reports an inconsistent debit balance rather than depreciating it silently', async () => {
  const fixture = setup({
    priorDepreciation: 20,
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
      entry(JOURNALS.FXA_DEP_OUT, '2026-01-02', 25, TR_SIDES.DEBIT),
    ],
  });
  const [detail] = await fixture.run();
  expect(detail.error).toContain('2026-01-02');
  expect(detail.depreciationAmount).toBe(0);
});

test('a new asset missing from the previous snapshot retains opening entries on the snapshot date', async () => {
  const fixture = setup({
    priorDepreciation: 20,
    snapshotHasAsset: false,
    acquisitionDate: '2026-01-02',
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-02', 100),
      entry(JOURNALS.FXA_DEP_IN, '2026-01-01', 20),
    ],
  });
  const [detail] = await fixture.run();
  expect(detail.preDeprecation).toBe(20);
  expect(detail.closingAccumulatedDepreciation).toBeCloseTo(20 + 1 / 31, 8);
});

test('a fully depreciated ledger does not restart historical depreciation', async () => {
  const fixture = setup({
    priorDepreciation: 100,
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
      entry(JOURNALS.FXA_DEP_IN, '2025-12-31', 100),
    ],
  });
  const [detail] = await fixture.run();
  expect(detail.preDeprecation).toBe(100);
  expect(detail.depreciationAmount).toBe(0);
  expect(detail.closingBookValue).toBe(0);
});

test('inactive and future depreciation entries do not affect the period', async () => {
  const inactive = entry(JOURNALS.FXA_DEP_IN, '2026-01-02', 50);
  inactive.status = TR_STATUSES.DRAFT;
  const fixture = setup({
    priorDepreciation: 20,
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
      inactive,
      entry(JOURNALS.FXA_DEP_IN, '2026-01-03', 50),
    ],
  });
  const [detail] = await fixture.run();
  expect(detail.closingAccumulatedDepreciation).toBeCloseTo(20 + 1 / 31, 8);
});

test('a mid-period correction changes rates only from its effective date', async () => {
  const correction = entry(
    JOURNALS.FXA_JUSTIFY,
    '2026-01-03',
    0,
    TR_SIDES.CREDIT,
    0,
  );
  correction.details[0].followInfos = { annualDepreciationRate: 24 };
  const fixture = setup({
    transactions: [entry(JOURNALS.FXA_INCOME, '2026-01-01', 100), correction],
  });
  const [detail] = await fixture.run('2026-01-04');
  expect(detail.depreciationAmount).toBeCloseTo(6 / 31, 8);
  expect(detail.originalCost).toBe(100);
});

test('a correction uses the new method and a ledger delta without resetting accumulated depreciation', async () => {
  const correction = entry(
    JOURNALS.FXA_JUSTIFY,
    '2026-01-02',
    5,
    TR_SIDES.CREDIT,
    0,
  );
  correction.details[0].followInfos = {
    depreciationMethod: 'decliningBalance',
    annualDepreciationRate: 20,
  };
  const fixture = setup({
    priorDepreciation: 20,
    transactions: [entry(JOURNALS.FXA_INCOME, '2026-01-01', 100), correction],
  });
  const [detail] = await fixture.run();
  expect(detail.depreciationAmount).toBeCloseTo((75 * 0.2) / 365, 8);
  expect(detail.closingAccumulatedDepreciation).toBeCloseTo(
    25 + (75 * 0.2) / 365,
    8,
  );
});

test('draft and future correction rules never affect historical depreciation', async () => {
  const draft = entry(
    JOURNALS.FXA_JUSTIFY,
    '2026-01-02',
    5,
    TR_SIDES.CREDIT,
    0,
  );
  draft.status = TR_STATUSES.DRAFT;
  draft.details[0].followInfos = { annualDepreciationRate: 90 };
  const future = entry(
    JOURNALS.FXA_JUSTIFY,
    '2026-01-04',
    5,
    TR_SIDES.CREDIT,
    0,
  );
  future.details[0].followInfos = { annualDepreciationRate: 80 };
  const fixture = setup({
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
      draft,
      future,
    ],
  });
  const [detail] = await fixture.run('2026-01-03');
  expect(detail.depreciationAmount).toBeCloseTo(3 / 31, 8);
});

test('a later period keeps correction rules from before its opening snapshot', async () => {
  const correction = entry(
    JOURNALS.FXA_JUSTIFY,
    '2026-01-01',
    0,
    TR_SIDES.CREDIT,
    0,
  );
  correction.details[0].followInfos = {
    annualDepreciationRate: 24,
    salvageValue: 0,
  };
  const fixture = setup({
    priorDepreciation: 20,
    transactions: [entry(JOURNALS.FXA_INCOME, '2026-01-01', 100), correction],
  });
  const [detail] = await fixture.run();
  expect(detail.preDeprecation).toBe(20);
  expect(detail.depreciationAmount).toBeCloseTo(2 / 31, 8);
});

test('capitalized cost only affects depreciation and closing cost from the capitalization day', async () => {
  const capital = entry(
    JOURNALS.FXA_CAPITAL,
    '2026-01-03',
    100,
    TR_SIDES.DEBIT,
    0,
  );
  capital.details[0].followInfos = {
    originalCost: 200,
    annualDepreciationRate: 12,
    depreciationBase: 200,
    depreciationStartDate: new Date('2026-01-03'),
  };
  const fixture = setup({
    transactions: [entry(JOURNALS.FXA_INCOME, '2026-01-01', 100), capital],
  });
  const [before] = await fixture.run('2026-01-02');
  expect(before.originalCost).toBe(100);
  expect(before.depreciationAmount).toBeCloseTo(2 / 31, 8);
  const [after] = await fixture.run('2026-01-04');
  expect(after.originalCost).toBe(200);
  expect(after.openingBookValue).toBe(100);
  expect(after.depreciationAmount).toBeCloseTo(6 / 31, 8);
});

test('renewal depreciates the new net base over the new life while retaining posted depreciation', async () => {
  const capital = entry(
    JOURNALS.FXA_CAPITAL,
    '2026-01-02',
    100,
    TR_SIDES.DEBIT,
    0,
  );
  capital.details[0].followInfos = {
    originalCost: 200,
    annualDepreciationRate: 20,
    depreciationBase: 150,
    depreciationStartDate: new Date('2026-01-02'),
  };
  const fixture = setup({
    priorDepreciation: 40,
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2026-01-01', 100),
      capital,
      entry(JOURNALS.FXA_DEP_IN, '2026-01-02', 10),
    ],
  });
  const [detail] = await fixture.run();
  expect(detail.depreciationAmount).toBeCloseTo((150 * 0.2) / 12 / 31, 8);
  expect(detail.closingAccumulatedDepreciation).toBeCloseTo(
    50 + (150 * 0.2) / 12 / 31,
    8,
  );
  expect(detail.originalCost).toBe(200);
});

test('a fully disposed asset absent from the last snapshot stays absent in later periods', async () => {
  const fixture = setup({
    priorDepreciation: 0,
    snapshotHasAsset: false,
    acquisitionDate: '2025-12-01',
    transactions: [
      entry(JOURNALS.FXA_INCOME, '2025-12-01', 100),
      entry(JOURNALS.FXA_OUT, '2026-01-01', 100),
      entry(JOURNALS.FXA_DEP_OUT, '2026-01-01', 100, TR_SIDES.DEBIT, 0),
    ],
  });
  expect(await fixture.run()).toEqual([]);
});
