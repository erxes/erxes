import { IModels } from '~/connectionResolvers';
import { ADJ_FXA_STATUSES } from '../../@types/adjustFixedAsset';
import { attachPreviousFxaDetails } from '../fxaAdjustmentState';

const query = <T>(rows: T) => ({
  sort() {
    return this;
  },
  lean: async () => rows,
});
const snapshot = (asset: string, branch = '', department = '') => ({
  adjustId: 'current',
  fixedAssetId: asset,
  branchId: branch,
  departmentId: department,
  originalCost: 100,
  accumulatedDepreciation: 20,
});

test('previous snapshots match asset, branch and department rather than row position', async () => {
  const previousRows = [
    {
      ...snapshot('b', 'north', 'team'),
      _id: 'b-old',
      adjustId: 'previous',
      originalCost: 70,
    },
    {
      ...snapshot('a', 'south', 'team'),
      _id: 'a-south',
      adjustId: 'previous',
      originalCost: 80,
    },
    {
      ...snapshot('a', 'north', 'team'),
      _id: 'a-north',
      adjustId: 'previous',
      originalCost: 90,
    },
    {
      ...snapshot('a', 'north', 'other'),
      _id: 'a-other-team',
      adjustId: 'previous',
      originalCost: 60,
    },
  ];
  const findOne = jest.fn((filter: Record<string, unknown>) =>
    query(
      filter._id
        ? { _id: 'current', date: new Date('2026-02-28') }
        : { _id: 'previous', date: new Date('2026-01-31') },
    ),
  );
  const find = jest.fn(() => query(previousRows));
  const models = {
    AdjustFixedAssets: { findOne },
    AdjustFxaDetails: { find },
  } as unknown as IModels;
  const rows = await attachPreviousFxaDetails(models, 'current', [
    snapshot('a', 'north', 'team'),
    snapshot('b', 'north', 'team'),
    snapshot('a', 'south', 'team'),
    snapshot('a', 'new-location', 'team'),
  ]);
  expect(rows.map((row) => row.previous?._id || null)).toEqual([
    'a-north',
    'b-old',
    'a-south',
    null,
  ]);
  expect(find).toHaveBeenCalledTimes(1);
  expect(find).toHaveBeenCalledWith({
    adjustId: 'previous',
    fixedAssetId: { $in: ['a', 'b'] },
  });
  expect(findOne).toHaveBeenLastCalledWith({
    date: { $lt: new Date('2026-02-28') },
    status: { $in: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH] },
  });
  expect(rows[0].originalCost).toBe(100);
  expect(rows[0].previous?.originalCost).toBe(90);
});

test('the first adjustment has no previous snapshot and does not query detail history', async () => {
  const find = jest.fn();
  const models = {
    AdjustFixedAssets: {
      findOne: (filter: Record<string, unknown>) =>
        query(filter._id ? { date: new Date('2026-01-31') } : null),
    },
    AdjustFxaDetails: { find },
  } as unknown as IModels;
  const [result] = await attachPreviousFxaDetails(models, 'current', [
    snapshot('new-asset'),
  ]);
  expect(result.previous).toBeNull();
  expect(find).not.toHaveBeenCalled();
});

test('empty pages require no history reads', async () => {
  await expect(
    attachPreviousFxaDetails({} as IModels, 'current', []),
  ).resolves.toEqual([]);
});
