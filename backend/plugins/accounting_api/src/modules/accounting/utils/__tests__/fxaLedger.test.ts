import {
  assertFxaAcquisitionConsistency,
  buildFxaLedgerAssets,
  getFxaLedgerAssets,
} from '../fxaLedger';
import { JOURNALS, TR_SIDES, TR_STATUSES } from '../../@types/constants';
import { IFixedAsset } from '@/fixedAssets/@types/fixedAsset';
import { ITransaction } from '../../@types/transaction';
import { IModels } from '~/connectionResolvers';

const asset: IFixedAsset & { _id: string } = {
  _id: 'asset',
  code: 'PC',
  name: 'Computer',
  categoryId: 'computers',
  status: 'active',
};
const entry = (
  journal: string,
  count: number,
  amount: number,
  accountId = 'asset-account',
): ITransaction => ({
  _id: journal,
  date: new Date('2026-01-01'),
  journal,
  side: [JOURNALS.FXA_DEP_IN, JOURNALS.FXA_DEP, JOURNALS.FXA_OUT].includes(
    journal,
  )
    ? TR_SIDES.CREDIT
    : TR_SIDES.DEBIT,
  details: [
    {
      fixedAssetId: 'asset',
      accountId,
      count,
      amount,
      followInfos: {
        depreciationMethod: 'straightLine',
        annualDepreciationRate: 100 / 3,
        salvageValue: 0,
        taxDepreciationMethod: 'straightLine',
        taxAnnualDepreciationRate: 100 / 3,
        taxSalvageValue: 0,
      },
    },
  ],
});
const project = (transactions: ITransaction[]) =>
  buildFxaLedgerAssets(
    [asset],
    transactions,
    new Map([['asset-account', 'depreciation-account']]),
  );

test('identity without income never invents an acquisition or a balance', () => {
  expect(project([])).toEqual([]);
  expect(project([entry(JOURNALS.FXA_MOVE_IN, 2, 500)])).toEqual([]);
});

test('split income details determine acquisition quantity, cost and frozen depreciation rules', () => {
  const income = entry(JOURNALS.FXA_INCOME, 2, 600);
  income.details.push({
    ...income.details[0],
    count: 1,
    amount: 300,
    branchId: 'other',
  });
  const [result] = project([income]);
  expect(result).toMatchObject({
    count: 3,
    currentCount: 3,
    originalCost: 300,
    accountId: 'asset-account',
    annualDepreciationRate: 100 / 3,
    salvageValue: 0,
    bookValue: 900,
  });
});

test('posted details determine remaining quantity and depreciation without any master cache', () => {
  const [result] = project([
    entry(JOURNALS.FXA_INCOME, 3, 900),
    entry(JOURNALS.FXA_DEP_IN, 0, 60, 'depreciation-account'),
    entry(JOURNALS.FXA_DEP, 0, 30, 'depreciation-account'),
    entry(JOURNALS.FXA_OUT, 1, 300),
    entry(JOURNALS.FXA_DEP_OUT, 0, 30, 'depreciation-account'),
  ]);
  expect(result).toMatchObject({
    currentCount: 2,
    accumulatedDepreciation: 60,
    bookValue: 540,
  });
});

test('loader scopes active ledger entries to the requested business date and excludes the edited parent', async () => {
  const find = jest.fn(() => ({
    lean: async () => [entry(JOURNALS.FXA_INCOME, 3, 900)],
  }));
  const models = {
    FixedAssets: { find: jest.fn(() => ({ lean: async () => [asset] })) },
    Transactions: {
      find,
      findOne: jest.fn(() => ({
        lean: async () => ({ _id: 'source', parentId: 'workflow' }),
      })),
    },
    Configs: { getConfigs: async () => [] },
  };
  await getFxaLedgerAssets(
    models as unknown as IModels,
    new Date('2026-01-31'),
    ['asset'],
    'source',
  );
  expect(find).toHaveBeenCalledWith(
    expect.objectContaining({
      'details.fixedAssetId': { $in: ['asset'] },
      parentId: { $ne: 'workflow' },
      status: { $in: expect.arrayContaining([TR_STATUSES.COMPLETE]) },
      date: { $lt: new Date('2026-02-01T00:00:00') },
    }),
  );
});

test('one acquisition may split locations but cannot silently mix a different cost or schedule', () => {
  const income = entry(JOURNALS.FXA_INCOME, 2, 600);
  const first = { key: 'PC', date: income.date, detail: income.details[0] };
  expect(() =>
    assertFxaAcquisitionConsistency([
      first,
      {
        ...first,
        detail: { ...first.detail, count: 1, amount: 300, branchId: 'other' },
      },
    ]),
  ).not.toThrow();
  expect(() =>
    assertFxaAcquisitionConsistency([
      first,
      { ...first, detail: { ...first.detail, amount: 800 } },
    ]),
  ).toThrow('separate asset code');
  expect(() =>
    assertFxaAcquisitionConsistency([
      first,
      {
        ...first,
        detail: {
          ...first.detail,
          followInfos: {
            ...first.detail.followInfos,
            annualDepreciationRate: 10,
          },
        },
      },
    ]),
  ).toThrow('separate asset code');
});
