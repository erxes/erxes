import { IContext } from '~/connectionResolvers';
import fixedAssets from '../fixedAssets';

const records = [
  {
    _id: 'income-owner',
    transactionId: 'income',
    fixedAssetId: 'asset',
    ownerId: 'a',
    action: 'received',
    count: 5,
  },
  {
    _id: 'move-out',
    transactionId: 'move',
    fixedAssetId: 'asset',
    ownerId: 'a',
    action: 'handedOver',
    count: 5,
  },
  {
    _id: 'move-in',
    transactionId: 'move',
    fixedAssetId: 'asset',
    ownerId: 'b',
    action: 'received',
    count: 5,
  },
];
test('editing a saved transfer restores the original owner availability and excludes its incoming allocation', async () => {
  const find = jest.fn((filter: { transactionId?: { $ne?: string } }) => ({
    lean: async () =>
      records.filter((row) => row.transactionId !== filter.transactionId?.$ne),
  }));
  const context = {
    models: { FxaOwnerRecords: { find } },
  } as unknown as IContext;
  const params = {
    balanceOnly: true,
    fixedAssetId: 'asset',
    excludeTransactionId: 'move',
  };
  const balances = await fixedAssets.fxaOwnerRecords(
    undefined,
    params,
    context,
  );
  expect(balances).toEqual([
    expect.objectContaining({ _id: 'asset:a', ownerId: 'a', count: 5 }),
  ]);
  expect(
    await fixedAssets.fxaOwnerRecordsCount(undefined, params, context),
  ).toBe(1);
  expect(find).toHaveBeenCalledWith(
    expect.objectContaining({ transactionId: { $ne: 'move' } }),
  );
});
