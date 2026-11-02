import {
  buildFxaCapitalPreview,
  TFxaCapitalValuation,
} from '@/transactions/transaction-form/components/forms/hooks/useFxaCapitalPreview';
import { JOURNALS_BY_JOURNAL } from '@/transactions/transaction-form/contants/defaultValues';
import { transactionFxaCapitalSchema } from '@/transactions/transaction-form/contants/transactionSchema';
import { TrJournalEnum } from '@/transactions/types/constants';
import { getRateFromUsefulLife } from '@/settings/fixed-assets/utils/depreciationRate';

jest.mock('react-i18next', () => ({
  getI18n: () => ({ t: (value: string) => value }),
}));

jest.mock('ui-modules', () => ({ CustomerType: { CUSTOMER: 'customer' } }), {
  virtual: true,
});

const valuation: TFxaCapitalValuation = {
  fixedAssetId: 'asset',
  accountId: 'asset-account',
  depreciationAccountId: 'dep-account',
  count: 3,
  originalCost: 100,
  preDeprecation: 30,
  annualDepreciationRate: 10,
  depreciationMethod: 'straightLine',
  salvageValue: 0,
  depreciationStartDate: '2026-01-01',
  depreciationThrough: '2026-01-31',
  ready: true,
  locations: [
    { branchId: 'a', departmentId: '', count: 2 },
    { branchId: 'b', departmentId: '', count: 1 },
  ],
};
const journal = () =>
  JOURNALS_BY_JOURNAL(TrJournalEnum.FXA_CAPITAL, {
    _id: 'capital',
    followInfos: { capitalAccountId: 'offset-account' },
    details: [
      {
        _id: 'first',
        fixedAssetId: 'asset',
        accountId: 'asset-account',
        count: 0,
        amount: 0,
        followInfos: {
          originalCost: 150,
          preDeprecation: 40,
          annualDepreciationRate: getRateFromUsefulLife(5),
          depreciationMethod: 'straightLine',
          capitalizationType: 'improvement',
          salvageValue: 0,
        },
      },
    ],
  });

test('preview allocates capitalized cost by quantity and balances against generated depreciation and counterpart entries', () => {
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
  ).toBe(0);
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

test('capitalization form rejects an impossible net book value before submission', () => {
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
  ).toBe(false);
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
