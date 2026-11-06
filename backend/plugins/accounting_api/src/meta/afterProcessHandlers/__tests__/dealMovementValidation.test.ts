/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { dealToMovementTrs } from '../dealToMovementTrs';
import { dealToReturnTrs } from '../dealToReturnTrs';
import { activeCost } from '~/modules/accounting/utils/inventories';
import { ITransaction } from '~/modules/accounting/@types/transaction';

jest.mock('erxes-api-shared/utils', () => ({
  fixNum: (value: number) => value,
}));
jest.mock('~/modules/accounting/utils/inventories', () => ({
  activeCost: jest.fn(),
}));

describe('deal sync prerequisites', () => {
  const find = jest.fn();
  const findOne = jest.fn();
  const createPTransaction = jest.fn<
    Promise<ITransaction[]>,
    [ITransaction[], string, object]
  >();
  const updatePTransaction = jest.fn<
    Promise<ITransaction[]>,
    [string, ITransaction[], string, object]
  >();
  const models = {
    Transactions: { find, findOne, createPTransaction, updatePTransaction },
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

  describe.each([false, true])('movement owner (resync=%s)', (resync) => {
    it.each([
      [{ companyId: 'company', customerId: 'customer' }, 'company', 'company'],
      [{ companyId: null, customerId: 'customer' }, 'customer', 'customer'],
      [{ companyId: 'company', customerId: null }, 'company', 'company'],
      [{ companyId: null, customerId: null }, 'customer', undefined],
    ] as const)(
      'uses direct deal owner %j',
      async (owner, customerType, customerId) => {
        find.mockReturnValue({
          lean: async () =>
            resync
              ? [
                  {
                    _id: 'movement',
                    parentId: 'parent',
                    ptrId: 'pointer',
                    customerType: 'company',
                    customerId: 'previous-company',
                  },
                ]
              : [],
        });
        jest
          .mocked(activeCost)
          .mockResolvedValue({
            product: { unitCost: 10, remainder: 5, totalCost: 50 },
          });
        await dealToMovementTrs({
          subdomain: 'tenant',
          models,
          userId: 'user',
          deal: {
            _id: 'deal',
            ...owner,
            productsData: [
              { productId: 'product', quantity: 1, tickUsed: true },
            ],
          },
          config: {
            dateRule: 'alwaysNow',
            sourceAccountId: 'source',
            destinationAccountId: 'destination',
            dealLocationSide: 'source',
          },
        });
        const docs = resync
          ? updatePTransaction.mock.calls[0][1]
          : createPTransaction.mock.calls[0][0];
        expect(docs).toHaveLength(1);
        expect(docs[0].customerType).toBe(customerType);
        expect(docs[0].customerId).toBe(customerId);
      },
    );
  });
});
