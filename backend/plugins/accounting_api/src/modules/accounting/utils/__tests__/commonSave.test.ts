/// <reference types="jest" />

jest.mock('@/accounting/utils/transactionDateValidation', () => ({
  validateTransactionDate: jest.fn().mockResolvedValue(undefined),
}));

import { IModels } from '~/connectionResolvers';
import { ITransaction } from '../../@types/transaction';
import { commonSave, commonSaveValidation } from '../commonSave';
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

const accountModel = (journal: string, id = 'inventory-account') => ({
  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue([{ _id: id, journal }]),
  }),
});

describe('commonSave account journals', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([commonSaveValidation, commonSave])(
    '%p rejects an incompatible account on a later detail before saving',
    async (save) => {
      const find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'general', journal: 'main' },
          { _id: 'debt', code: '1200', journal: 'debt' },
        ]),
      });
      const models = { Accounts: { find } } as unknown as IModels;
      const doc: ITransaction = {
        date: new Date(),
        journal: 'main',
        details: [
          { accountId: 'general', amount: 20 },
          { accountId: 'general', amount: 40 },
          { accountId: 'debt', amount: 30 },
        ],
      };

      await expect(save('tenant', models, 'user', doc)).rejects.toThrow(
        'Account 1200 (debt) is not allowed in the main journal',
      );
      expect(find).toHaveBeenCalledTimes(1);
      expect(find).toHaveBeenCalledWith(
        { _id: { $in: ['general', 'debt'] } },
        expect.objectContaining({ journal: 1 }),
      );
      expect(createOrUpdateTr).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['main', 'main', true],
    ['main', 'invFollow', true],
    ['main', 'fxaFollow', true],
    ['receivable', 'debt', true],
    ['payable', 'debt', true],
    ['receivable', 'main', false],
    ['payable', 'cash', false],
    ['cash', 'bank', false],
    ['bank', 'cash', false],
    ['tax', 'debt', false],
    ['invIncome', 'inventory', true],
    ['invMove', 'invFollow', false],
    ['invSale', 'invFollow', true],
    ['invSaleReturn', 'inventory', false],
    ['fxaMove', 'fixedAsset', true],
    ['fxaOut', 'fxaFollow', false],
    ['fxaSale', 'fxaFollow', true],
    ['exchangeDiff', 'debt', false],
  ])('checks %s against %s', async (journal, accountJournal, allowed) => {
    const models = {
      Accounts: accountModel(accountJournal, 'account'),
    } as unknown as IModels;
    const result = commonSaveValidation('tenant', models, 'user', {
      date: new Date(),
      journal,
      details: [{ accountId: 'account', amount: 20 }],
    });

    if (allowed) {
      await expect(result).resolves.toBeUndefined();
    } else {
      await expect(result).rejects.toThrow(
        `is not allowed in the ${journal} journal`,
      );
    }
  });

  it.each([
    ['accounting:adjustFundRate', 'cash'],
    ['accounting:adjustFundRate', 'bank'],
    ['accounting:adjustDebtRate', 'debt'],
  ])('permits %s to revalue a %s account', async (contentType, journal) => {
    const models = {
      Accounts: accountModel(journal, 'account'),
    } as unknown as IModels;
    await expect(
      commonSaveValidation('tenant', models, 'user', {
        date: new Date(),
        journal: 'exchangeDiff',
        contentType,
        contentId: 'adjustment',
        details: [{ accountId: 'account', amount: 20 }],
      }),
    ).resolves.toBeUndefined();
  });
});

describe('commonSave inventory costs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['fxaDep', 'dt'],
    ['fxaDep', 'ct'],
    ['fxaDeferredTax', 'dt'],
    ['fxaDeferredTax', 'ct'],
  ])('posts %s %s through commonSave', async (journal, side) => {
    const doc: ITransaction = {
      date: new Date(),
      journal,
      side,
      details: [{ accountId: 'account', fixedAssetId: 'asset', amount: 20 }],
    };
    const saved = { ...doc, _id: 'depreciation' };
    const models = {
      Accounts: accountModel('fxaFollow', 'account'),
      Configs: { getConfigValue: jest.fn().mockResolvedValue(false) },
      Transactions: {
        getTransaction: jest.fn().mockResolvedValue(saved),
        find: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([]) })),
      },
    } as unknown as IModels;
    jest.mocked(createOrUpdateTr).mockResolvedValue(saved as never);
    expect((await commonSave('tenant', models, 'user', doc)).mainTr).toEqual(
      saved,
    );
    expect(createOrUpdateTr).toHaveBeenCalledWith(
      models,
      'user',
      doc,
      undefined,
    );
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
      Accounts: accountModel('tax', 'tax-account'),
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
      Accounts: accountModel('inventory'),
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
      Accounts: accountModel('inventory'),
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
      Accounts: accountModel('inventory'),
      Transactions: {
        getTransaction: jest.fn().mockResolvedValue(saved),
        find: jest.fn().mockReturnValue({
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
    jest.mocked(activeCost).mockResolvedValue({
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
      details: [
        {
          accountId: 'inventory-account',
          productId: 'product-a',
          count: 9,
          amount: 50,
        },
      ],
    } as ITransaction;
    const savedTransaction = {
      ...doc,
      details: [{ productId: 'product-a', count: 0, amount: 50 }],
    };
    const models = {
      Accounts: accountModel('inventory'),
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
