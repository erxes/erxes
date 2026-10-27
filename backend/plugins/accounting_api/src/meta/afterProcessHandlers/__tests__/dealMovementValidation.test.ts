/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { dealToMovementTrs } from '../dealToMovementTrs';
import { dealToReturnTrs } from '../dealToReturnTrs';

jest.mock('erxes-api-shared/utils', () => ({
  fixNum: (value: number) => value,
}));
jest.mock('~/modules/accounting/utils/inventories', () => ({
  activeCost: jest.fn(),
}));

describe('deal sync prerequisites', () => {
  const find = jest.fn();
  const findOne = jest.fn();
  const createPTransaction = jest.fn();
  const models = {
    Transactions: { find, findOne, createPTransaction },
  } as unknown as IModels;

  beforeEach(() => jest.clearAllMocks());

  it.each([
    undefined,
    [],
    [{ productId: 'product', quantity: 1, tickUsed: false }],
    [{ productId: 'product', quantity: 0, tickUsed: true }],
    [{ productId: 'product', quantity: -1, tickUsed: true }],
  ])(
    'rejects missing eligible movement products (%j)',
    async (productsData) => {
      await expect(
        dealToMovementTrs({
          subdomain: 'tenant',
          models,
          userId: 'user',
          deal: { _id: 'deal', productsData },
          config: {
            dateRule: 'alwaysNow',
            sourceAccountId: 'source',
            destinationAccountId: 'destination',
            dealLocationSide: 'source',
          },
        }),
      ).rejects.toThrow('Deal has no selected products with positive quantity');
      expect(find).not.toHaveBeenCalled();
      expect(createPTransaction).not.toHaveBeenCalled();
    },
  );

  it('rejects a return without an original sale', async () => {
    find.mockReturnValue({ lean: async () => [] });
    findOne.mockReturnValue({ lean: async () => null });
    await expect(
      dealToReturnTrs({
        models,
        userId: 'user',
        deal: { _id: 'deal' },
        config: {
          dateRule: 'alwaysNow',
          defaultPayment: { accountId: 'cash' },
          returnType: 'fullTr',
        },
      }),
    ).rejects.toThrow('Deal sale transaction was not found');
    expect(createPTransaction).not.toHaveBeenCalled();
  });
});
