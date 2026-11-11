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

const fixture = (taxRate?: number, status = ADJ_FXA_STATUSES.COMPLETE) => {
  const header = {
    _id: 'adjust',
    date: new Date('2026-01-31'),
    status,
    taxRate,
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

test.each([undefined, -1, 101, NaN, Infinity])(
  'invalid legacy tax rate %s fails before clearing posted journals',
  async (taxRate) => {
    const { context, update } = fixture();
    await expect(
      AdjustFixedAssets.adjustFixedAssetRun(
        undefined,
        { adjustId: 'adjust', taxRate },
        context,
      ),
    ).rejects.toThrow('Enter an income tax rate');
    expect(clearAdjustFixedAsset).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  },
);

test.each([0, 10])(
  'legacy first rerun persists and calculates with supplied tax rate %s',
  async (taxRate) => {
    const { context, update } = fixture();
    await AdjustFixedAssets.adjustFixedAssetRun(
      undefined,
      { adjustId: 'adjust', taxRate },
      context,
    );
    expect(clearAdjustFixedAsset).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      'adjust',
      expect.objectContaining({ taxRate, status: 'running' }),
    );
    expect(runAdjustFixedAsset).toHaveBeenCalledWith(
      context.models,
      'user',
      expect.objectContaining({
        taxRate,
        status: 'running',
        date: new Date('2026-01-31'),
      }),
    );
  },
);

test('omitted rate reuses the saved percentage', async () => {
  const { context } = fixture(25);
  await AdjustFixedAssets.adjustFixedAssetRun(
    undefined,
    { adjustId: 'adjust' },
    context,
  );
  expect(runAdjustFixedAsset).toHaveBeenCalledWith(
    context.models,
    'user',
    expect.objectContaining({ taxRate: 25 }),
  );
});

test('published legacy period must cancel before supplying a rate', async () => {
  const { context } = fixture(undefined, ADJ_FXA_STATUSES.PUBLISH);
  await expect(
    AdjustFixedAssets.adjustFixedAssetRun(
      undefined,
      { adjustId: 'adjust', taxRate: 10 },
      context,
    ),
  ).rejects.toThrow('cannot be calculated');
  expect(clearAdjustFixedAsset).not.toHaveBeenCalled();
});
