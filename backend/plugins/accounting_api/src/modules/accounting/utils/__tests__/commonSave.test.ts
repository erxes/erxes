/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { ITransaction } from '../../@types/transaction';
import { commonSave } from '../commonSave';
import { activeCost } from '../inventories';
import {
  createOrUpdateTr,
  removeSyncProductsInventory,
  syncProductsInventory,
} from '../utils';

jest.mock('../utils', () => ({
  createOrUpdateTr: jest.fn(),
  removeSyncProductsInventory: jest.fn(),
  syncProductsInventory: jest.fn(),
}));

jest.mock('../inventories', () => ({
  activeCost: jest.fn(),
}));

describe('commonSave inventory costs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('supports a tax-account single credit without generating additional tax rows', async () => {
    const doc: ITransaction = {
      date: new Date(),
      journal: 'tax',
      side: 'ct',
      details: [{ accountId: 'tax-account', amount: 20 }],
    };
    const saved = { ...doc, _id: 'tax-credit' };
    const models = {
      Configs: { getConfigValue: jest.fn().mockResolvedValue(false) },
      Transactions: {
        getTransaction: jest.fn().mockResolvedValue(saved),
        find: jest
          .fn()
          .mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      },
    } as unknown as IModels;
    jest.mocked(createOrUpdateTr).mockResolvedValue(saved as never);
    const result = await commonSave('tenant', models, 'user', doc);
    expect(createOrUpdateTr).toHaveBeenCalledWith(
      models,
      'user',
      doc,
      undefined,
    );
    expect(result.otherTrs).toEqual([]);
  });

  it('persists cost changes without inventory quantity movement', async () => {
    const doc = {
      journal: 'invJustify',
      side: 'dt',
      details: [
        {
          accountId: 'inventory-account',
          productId: 'product-a',
          count: 12,
          unitPrice: 5,
          amount: 50,
        },
      ],
    } as ITransaction;
    const savedTransaction = { ...doc, _id: 'adjustment-1' };
    const models = {
      Transactions: {
        getTransaction: jest.fn().mockResolvedValue(savedTransaction),
      },
    } as unknown as IModels;

    jest.mocked(createOrUpdateTr).mockResolvedValue(savedTransaction as never);

    await commonSave('tenant', models, 'user-1', doc);

    expect(createOrUpdateTr).toHaveBeenCalledWith(
      models,
      'user-1',
      expect.objectContaining({
        details: [expect.objectContaining({ count: 0, amount: 50 })],
      }),
      undefined,
    );
    expect(syncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      savedTransaction,
      undefined,
      1,
    );
    expect(removeSyncProductsInventory).not.toHaveBeenCalled();
  });

  it('replaces an inventory out price and amount with active cost', async () => {
    const doc = {
      journal: 'invOut',
      side: 'dt',
      branchId: 'branch-a',
      departmentId: 'department-a',
      details: [
        {
          accountId: 'inventory-account',
          productId: 'product-a',
          count: 2,
          unitPrice: 999,
          amount: 1998,
        },
      ],
    } as ITransaction;
    const models = {
      Transactions: {
        getTransaction: jest.fn().mockImplementation(({ _id }) => ({ _id })),
      },
    } as unknown as IModels;

    jest.mocked(activeCost).mockResolvedValue({
      'product-a': { unitCost: 12, totalCost: 120, remainder: 10 },
    });
    jest
      .mocked(createOrUpdateTr)
      .mockImplementation(async (_models, _userId, savedDoc) => {
        return { ...savedDoc, _id: 'out-1' } as never;
      });

    await commonSave('tenant', models, 'user-1', doc);

    expect(activeCost).toHaveBeenCalledWith(
      models,
      'inventory-account',
      'branch-a',
      'department-a',
      ['product-a'],
      [],
    );
    expect(createOrUpdateTr).toHaveBeenCalledWith(
      models,
      'user-1',
      expect.objectContaining({
        side: 'ct',
        details: [
          expect.objectContaining({ unitPrice: 12, amount: 24, count: 2 }),
        ],
      }),
      undefined,
    );
  });

  it('excludes the complete old execution group when repricing a posted inventory out edit', async () => {
    const doc: ITransaction = {
      date: new Date(),
      journal: 'invOut',
      contentType: 'jobExecution',
      contentId: 'execution',
      details: [
        {
          accountId: 'inventory-account',
          productId: 'product-a',
          count: 4,
          amount: 0,
        },
      ],
    };
    const oldTransaction = { ...doc, _id: 'out', parentId: 'parent' };
    const saved = { ...doc, _id: 'out', parentId: 'parent' };
    const models = {
      Transactions: {
        getTransaction: jest.fn().mockResolvedValue(saved),
        find: jest
          .fn()
          .mockReturnValue({
            lean: jest
              .fn()
              .mockResolvedValue([
                { _id: 'out' },
                { _id: 'income' },
                { _id: 'cost' },
              ]),
          }),
      },
    } as unknown as IModels;
    jest
      .mocked(activeCost)
      .mockResolvedValue({
        'product-a': { unitCost: 12, totalCost: 120, remainder: 10 },
      });
    jest.mocked(createOrUpdateTr).mockResolvedValue(saved as never);
    await commonSave('tenant', models, 'user', doc, oldTransaction as never);
    expect(activeCost).toHaveBeenCalledWith(
      models,
      'inventory-account',
      undefined,
      undefined,
      ['product-a'],
      ['out', 'income', 'cost'],
    );
    expect(createOrUpdateTr).toHaveBeenCalledWith(
      models,
      'user',
      expect.objectContaining({
        details: [
          expect.objectContaining({ count: 4, unitPrice: 12, amount: 48 }),
        ],
      }),
      oldTransaction,
    );
  });

  it('reverses the previous cost direction before applying a side change', async () => {
    const oldTransaction = {
      _id: 'adjustment-1',
      journal: 'invJustify',
      side: 'dt',
      details: [{ productId: 'product-a', count: 0, amount: 50 }],
    };
    const doc = {
      ...oldTransaction,
      side: 'ct',
      details: [{ productId: 'product-a', count: 9, amount: 50 }],
    } as ITransaction;
    const savedTransaction = {
      ...doc,
      details: [{ productId: 'product-a', count: 0, amount: 50 }],
    };
    const models = {
      Transactions: {
        getTransaction: jest.fn().mockResolvedValue(savedTransaction),
      },
    } as unknown as IModels;

    jest.mocked(createOrUpdateTr).mockResolvedValue(savedTransaction as never);

    await commonSave('tenant', models, 'user-1', doc, oldTransaction as never);

    expect(removeSyncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      oldTransaction,
      1,
    );
    expect(syncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      savedTransaction,
      undefined,
      -1,
    );
  });
});
