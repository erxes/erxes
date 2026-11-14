import type { IContext } from '~/connectionResolvers';
import { AdjustFixedAssets } from '../adjustFixedAssets';
import {
  clearAdjustFixedAsset,
  runAdjustFixedAsset,
} from '../../../../utils/adjustFixedAssets';
import { ADJ_FXA_STATUSES } from '../../../../@types/adjustFixedAsset';

jest.mock('../../../../utils/adjustFixedAssets', () => ({
  clearAdjustFixedAsset: jest.fn(),
  runAdjustFixedAsset: jest.fn(),
}));

const fixture = (status = ADJ_FXA_STATUSES.COMPLETE) => {
  const header = {
    _id: 'adjust',
    date: new Date('2026-01-31'),
    status,
  };
  const update = jest.fn(async (_id: string, doc: Record<string, unknown>) => ({
    ...header,
    ...doc,
  }));
  const context = {
    user: { _id: 'user' },
    checkPermission: jest.fn(),
    models: {
      AdjustFixedAssets: {
        getAdjustFixedAsset: async () => header,
        updateAdjustFixedAsset: update,
      },
    },
  } as unknown as IContext;
  return { context, update };
};

beforeEach(() => jest.clearAllMocks());

test('runs without an adjustment-level tax percentage', async () => {
  const { context, update } = fixture();
  await AdjustFixedAssets.adjustFixedAssetRun(
    undefined,
    { adjustId: 'adjust' },
    context,
  );
  expect(clearAdjustFixedAsset).toHaveBeenCalledTimes(1);
  expect(update).toHaveBeenCalledWith('adjust', {
    status: 'running',
    error: '',
    warning: '',
    modifiedBy: 'user',
  });
  expect(runAdjustFixedAsset).toHaveBeenCalledWith(
    context.models,
    'user',
    expect.objectContaining({
      status: 'running',
      date: new Date('2026-01-31'),
    }),
  );
});

test.each([ADJ_FXA_STATUSES.PUBLISH, ADJ_FXA_STATUSES.RUNNING])(
  '%s periods cannot rerun or clear journals',
  async (status) => {
    const { context } = fixture(status);
    await expect(
      AdjustFixedAssets.adjustFixedAssetRun(
        undefined,
        { adjustId: 'adjust' },
        context,
      ),
    ).rejects.toThrow('cannot be calculated');
    expect(clearAdjustFixedAsset).not.toHaveBeenCalled();
  },
);

test('failed source calculations restore process status and expose the error', async () => {
  const { context, update } = fixture();
  jest
    .mocked(runAdjustFixedAsset)
    .mockRejectedValueOnce(new Error('Invalid acquisition tax rate'));
  await expect(
    AdjustFixedAssets.adjustFixedAssetRun(
      undefined,
      { adjustId: 'adjust' },
      context,
    ),
  ).rejects.toThrow('Invalid acquisition tax rate');
  expect(update).toHaveBeenLastCalledWith('adjust', {
    status: 'process',
    error: 'Invalid acquisition tax rate',
    modifiedBy: 'user',
  });
});
