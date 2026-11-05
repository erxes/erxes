import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '../../@types/transaction';
import { commonRemove } from '../commonRemove';
import { removeSyncProductsInventory } from '../utils';

jest.mock('../utils', () => ({ removeSyncProductsInventory: jest.fn() }));

const sale = {
  _id: 'sale',
  journal: 'invSale',
  parentId: 'parent',
  details: [],
} as ITransactionDocument;
const saleOut = {
  _id: 'sale-out',
  journal: 'invSaleOut',
  originId: 'sale',
  originType: 'invSaleOut',
  details: [],
} as ITransactionDocument;

const setup = () => {
  const find = jest
    .fn()
    .mockReturnValue({ lean: jest.fn().mockResolvedValue([saleOut]) });
  return { find, models: { Transactions: { find } } as unknown as IModels };
};

describe('ordinary sale removal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reuses loaded group rows and reverses only the matching sale movement', async () => {
    const { models, find } = setup();
    const other = { ...saleOut, _id: 'other-out', originId: 'other-sale' };
    await commonRemove('tenant', models, sale, [sale, other, saleOut]);
    expect(find).not.toHaveBeenCalled();
    expect(removeSyncProductsInventory).toHaveBeenCalledTimes(1);
    expect(removeSyncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      saleOut,
      -1,
    );
  });

  it('does not query again when the caller explicitly supplies no follows', async () => {
    const { models, find } = setup();
    await commonRemove('tenant', models, sale, []);
    expect(find).not.toHaveBeenCalled();
    expect(removeSyncProductsInventory).not.toHaveBeenCalled();
  });

  it('does not perform a journal-specific fallback lookup', async () => {
    const { models, find } = setup();
    await commonRemove('tenant', models, sale);
    expect(find).not.toHaveBeenCalled();
    expect(removeSyncProductsInventory).not.toHaveBeenCalled();
  });
});
