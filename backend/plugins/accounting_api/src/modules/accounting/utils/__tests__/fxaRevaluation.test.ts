import {
  allocateFxaRevaluation,
  sumFxaRevaluationBalances,
  getFxaRevaluationState,
  applyFxaDisposalRevaluation,
} from '../fxaRevaluationState';
import { buildFxaCapitalDocuments } from '../fxaCapital';
import { IModels } from '~/connectionResolvers';
import { validateFxaIncomeAcquisition } from '../fxaIncome';
import { ITransaction } from '../../@types/transaction';
import { JOURNALS, TR_SIDES } from '../../@types/constants';
import { TFxaCapitalValuation } from '../fxaCapitalValuation';

const query = <T>(value: T) => ({
  sort() {
    return this;
  },
  lean: async () => value,
});

test.each([
  ['A', -5, 6, 0, 1, 5, 0],
  ['B', -5, 4, 1, 0, 4, 0],
  ['C', 5, -6, 1, 0, 0, 5],
  ['D', 5, -4, 0, 1, 0, 4],
])(
  '%s splits subsequent valuation between recovery, reserve and profit/loss',
  (_label, first, second, loss, reserve) => {
    const opening = allocateFxaRevaluation(Number(first), 0, 0);
    const result = allocateFxaRevaluation(
      Number(second),
      opening.revaluationLoss,
      opening.revaluationReserve,
    );
    expect(result).toMatchObject({
      revaluationLoss: Number(loss) - opening.revaluationLoss,
      revaluationReserve: Number(reserve) - opening.revaluationReserve,
    });
  },
);

test.each([NaN, Infinity, -1])(
  'invalid opening loss %s is rejected',
  (value) => {
    expect(() => allocateFxaRevaluation(5, value, 0)).toThrow();
  },
);

const entry = (
  journal: string,
  date: string,
  count: number,
  followInfos: ITransaction['details'][number]['followInfos'],
): ITransaction => ({
  journal,
  date: new Date(date),
  side: TR_SIDES.DEBIT,
  details: [
    {
      fixedAssetId: 'asset',
      accountId: 'asset-account',
      amount: 0,
      count,
      followInfos,
    },
  ],
});

test('opening history is a recovery limit, not another reduction of asset cost', () => {
  const income = entry(JOURNALS.FXA_INCOME, '2026-01-01', 2, {
    revaluationLoss: 10,
    revaluationReserve: 0,
  });
  const capital = entry(JOURNALS.FXA_CAPITAL, '2026-02-01', 0, {
    originalCost: 1000,
  });
  const change = entry(JOURNALS.FXA_REVALUATION, '2026-03-01', 0, {
    ...allocateFxaRevaluation(12, 10, 0),
  });
  expect(sumFxaRevaluationBalances('asset', [income, capital, change])).toEqual(
    {
      count: 2,
      loss: 0,
      reserve: 2,
    },
  );
  const sale = entry(JOURNALS.FXA_SALE, '2026-04-01', 1, {
    revaluationReserve: -1,
  });
  expect(
    sumFxaRevaluationBalances('asset', [income, capital, change, sale]),
  ).toEqual({ count: 1, loss: 0, reserve: 1 });
});

test('active adjustment snapshot supplies limits and only later events are replayed', async () => {
  let filter: Record<string, unknown> = {};
  const change = entry(JOURNALS.FXA_REVALUATION, '2026-03-01', 0, {
    ...allocateFxaRevaluation(6, 5, 0),
  });
  const raw = {
    AdjustFixedAssets: {
      findOne: () => query({ _id: 'previous', date: new Date('2026-02-28') }),
    },
    AdjustFxaDetails: {
      find: () =>
        query([
          { count: 1, closingRevaluationLoss: 5, closingRevaluationReserve: 0 },
        ]),
    },
    Transactions: {
      find: (value: Record<string, unknown>) => {
        filter = value;
        return query([change]);
      },
    },
  };
  expect(
    await getFxaRevaluationState(
      raw as unknown as IModels,
      'asset',
      new Date('2026-03-01'),
      'edited',
    ),
  ).toEqual({ count: 1, loss: 0, reserve: 1 });
  expect(filter).toMatchObject({
    _id: { $ne: 'edited' },
    date: { $gte: new Date(2026, 2, 1), $lt: new Date(2026, 2, 2) },
  });
});

const valuation: TFxaCapitalValuation = {
  fixedAssetId: 'asset',
  accountId: 'asset-account',
  depreciationAccountId: 'dep-account',
  count: 3,
  originalCost: 30,
  preDeprecation: 8,
  annualDepreciationRate: 20,
  depreciationMethod: 'straightLine',
  salvageValue: 0,
  depreciationStartDate: new Date('2026-01-01'),
  depreciationThrough: new Date('2026-01-31'),
  ready: true,
  revaluationLoss: 15,
  revaluationReserve: 0,
  taxDepreciationMethod: 'straightLine',
  taxAnnualDepreciationRate: 20,
  taxSalvageValue: 0,
  locations: [
    { branchId: 'a', departmentId: '', count: 2 },
    { branchId: 'b', departmentId: '', count: 1 },
  ],
};

test('revaluation allocation uses the net cost/depreciation change across locations', () => {
  const doc = entry(JOURNALS.FXA_REVALUATION, '2026-02-01', 0, {
    originalCost: 37,
    preDeprecation: 9,
    annualDepreciationRate: 20,
  });
  const { main, follows } = buildFxaCapitalDocuments(doc, valuation);
  expect(main.details.map((detail) => detail.amount)).toEqual([14, 7]);
  expect(
    main.details.map((detail) => ({
      revaluationLoss: detail.followInfos?.revaluationLoss,
      revaluationReserve: detail.followInfos?.revaluationReserve,
    })),
  ).toEqual([
    { revaluationLoss: -10, revaluationReserve: 2 },
    { revaluationLoss: -5, revaluationReserve: 1 },
  ]);
  expect(follows[0].originType).toBe('fxaDepIn');
  expect(main.details.every((detail) => detail.count === 0)).toBe(true);
  doc.journal = JOURNALS.FXA_CAPITAL;
  expect(
    buildFxaCapitalDocuments(doc, valuation).main.details.every(
      (detail) =>
        detail.followInfos?.revaluationLoss === undefined &&
        detail.followInfos?.revaluationReserve === undefined,
    ),
  ).toBe(true);
});

test.each(['revaluationLoss', 'revaluationReserve'] as const)(
  'income rejects negative %s before touching financial models',
  async (field) => {
    const doc = entry(JOURNALS.FXA_INCOME, '2026-01-01', 1, { [field]: -1 });
    await expect(
      validateFxaIncomeAcquisition({} as IModels, 'user', doc),
    ).rejects.toThrow('Opening revaluation balances');
  },
);

test('partial disposal stores signed history deltas once and editing excludes itself', async () => {
  const income = entry(JOURNALS.FXA_INCOME, '2026-01-01', 3, {
    revaluationLoss: 0,
    revaluationReserve: 30,
  });
  let filter: Record<string, unknown> = {};
  const raw = {
    AdjustFixedAssets: { findOne: () => query(null) },
    Transactions: {
      find: (value: Record<string, unknown>) => {
        filter = value;
        return query([income]);
      },
    },
  };
  const sale = entry(JOURNALS.FXA_SALE, '2026-04-01', 1, {
    revaluationReserve: -999,
  });
  sale._id = 'sale';
  sale.details.push({ ...sale.details[0], count: 1 });
  const prepared = await applyFxaDisposalRevaluation(
    raw as unknown as IModels,
    sale,
  );
  expect(
    prepared.details.map((row) => row.followInfos?.revaluationReserve),
  ).toEqual([-10, -10]);
  expect(filter).toMatchObject({ _id: { $ne: 'sale' } });
  expect(sumFxaRevaluationBalances('asset', [income, prepared])).toEqual({
    count: 1,
    loss: 0,
    reserve: 10,
  });
});
