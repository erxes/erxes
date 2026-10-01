/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '../../@types/transaction';
import {
  buildInvSplitFollowDocs,
  normalizeInvSplitTransaction,
  syncInvSplitFollowTrs,
} from '../invSplit';
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

const makeTransaction = (
  overrides: Partial<ITransactionDocument> = {},
): ITransactionDocument =>
  ({
    _id: 'income-1',
    ptrId: 'ptr-1',
    parentId: 'parent-1',
    number: 'INV-1',
    date: new Date('2026-09-30'),
    journal: 'invIncome',
    side: 'dt',
    status: 'complete',
    ptrStatus: 'ok',
    details: [
      {
        _id: 'detail-1',
        accountId: 'inventory-account',
        productId: 'source-product',
        count: 2,
        unitPrice: 120,
        amount: 260,
        followInfos: {
          invSplit: {
            hasSplit: true,
            productId: 'split-product',
            ratio: 4,
          },
        },
      },
    ],
    ...overrides,
  }) as ITransactionDocument;

describe('inventory split follow transactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps total cost and applies the ratio to count and unit price', () => {
    const transaction = makeTransaction();

    const [outTransaction, incomeTransaction] = buildInvSplitFollowDocs(
      transaction,
      transaction,
      'split-ptr',
    );

    expect(outTransaction).toEqual(
      expect.objectContaining({
        journal: 'invOut',
        side: 'ct',
        ptrId: 'split-ptr',
        originId: 'income-1',
        originType: 'invSplitOut',
      }),
    );
    expect(outTransaction.details[0]).toEqual(
      expect.objectContaining({
        productId: 'source-product',
        count: 2,
        unitPrice: 130,
        amount: 260,
      }),
    );
    expect(incomeTransaction).toEqual(
      expect.objectContaining({
        journal: 'invIncome',
        side: 'dt',
        ptrId: 'split-ptr',
        originId: 'income-1',
        originType: 'invSplitIncome',
      }),
    );
    expect(incomeTransaction.details[0]).toEqual(
      expect.objectContaining({
        productId: 'split-product',
        count: 8,
        unitPrice: 32.5,
        amount: 260,
      }),
    );
  });

  it('uses the internal movement income location and account', () => {
    const originTransaction = makeTransaction({
      journal: 'invMove',
      details: [
        {
          _id: 'detail-1',
          accountId: 'inventory-account',
          productId: 'source-product',
          count: 2,
          unitPrice: 120,
          amount: 240,
          followInfos: {
            invSplit: {
              hasSplit: true,
              productId: 'split-product',
              ratio: 2,
            },
          },
        },
      ],
    });
    const moveInTransaction = makeTransaction({
      _id: 'move-in-1',
      journal: 'invMoveIn',
      branchId: 'destination-branch',
      departmentId: 'destination-department',
      details: [
        {
          _id: 'move-in-detail-1',
          originId: 'detail-1',
          accountId: 'destination-account',
          productId: 'source-product',
          count: 2,
          unitPrice: 120,
          amount: 240,
        },
      ],
    });

    const [outTransaction, incomeTransaction] = buildInvSplitFollowDocs(
      originTransaction,
      moveInTransaction,
      'split-ptr',
    );

    expect(outTransaction).toEqual(
      expect.objectContaining({
        originId: 'income-1',
        branchId: 'destination-branch',
        departmentId: 'destination-department',
      }),
    );
    expect(outTransaction.details[0].accountId).toBe('destination-account');
    expect(incomeTransaction.details[0].accountId).toBe('destination-account');
  });

  it('fails when an enabled split has no matching income detail', () => {
    const transaction = makeTransaction();
    const incomeTransaction = makeTransaction({ details: [] });

    expect(() =>
      buildInvSplitFollowDocs(transaction, incomeTransaction, 'split-ptr'),
    ).toThrow('Inventory split income detail not found: detail-1');
  });

  it('reuses generated detail ids while editing', () => {
    const transaction = makeTransaction();
    const existingOut = makeTransaction({
      _id: 'out-1',
      originType: 'invSplitOut',
      details: [
        {
          _id: 'existing-out-detail',
          originId: 'detail-1',
          accountId: 'inventory-account',
          productId: 'source-product',
          count: 2,
          unitPrice: 130,
          amount: 260,
        },
      ],
    });
    const existingIncome = makeTransaction({
      _id: 'split-income-1',
      originType: 'invSplitIncome',
      details: [
        {
          _id: 'existing-income-detail',
          originId: 'detail-1',
          accountId: 'inventory-account',
          productId: 'split-product',
          count: 8,
          unitPrice: 32.5,
          amount: 260,
        },
      ],
    });

    const [outTransaction, incomeTransaction] = buildInvSplitFollowDocs(
      transaction,
      transaction,
      'split-ptr',
      { out: existingOut, income: existingIncome },
    );

    expect(outTransaction.details[0]._id).toBe('existing-out-detail');
    expect(incomeTransaction.details[0]._id).toBe('existing-income-detail');
  });

  it('does not create follow transactions without split settings', () => {
    const transaction = makeTransaction({
      details: [
        {
          _id: 'detail-1',
          accountId: 'inventory-account',
          productId: 'source-product',
          count: 2,
          unitPrice: 120,
          amount: 260,
        },
      ],
    });

    expect(
      buildInvSplitFollowDocs(transaction, transaction, 'split-ptr'),
    ).toEqual([]);
  });

  it('does not create follow transactions when splitting is disabled', () => {
    const transaction = makeTransaction({
      details: [
        {
          _id: 'detail-1',
          accountId: 'inventory-account',
          productId: 'source-product',
          count: 2,
          unitPrice: 120,
          amount: 260,
          followInfos: {
            invSplit: {
              hasSplit: false,
            },
          },
        },
      ],
    });

    expect(
      buildInvSplitFollowDocs(transaction, transaction, 'split-ptr'),
    ).toEqual([]);
  });

  it('groups internal movement split details at the destination under a separate pointer', () => {
    const originTransaction = makeTransaction({
      journal: 'invMove',
      details: Array.from({ length: 5 }, (_, index) => ({
        _id: `detail-${index + 1}`,
        accountId: 'inventory-account',
        productId: `source-product-${index + 1}`,
        count: index + 1,
        unitPrice: 100,
        amount: (index + 1) * 100,
        followInfos: {
          invSplit:
            index < 3
              ? {
                  hasSplit: true as const,
                  productId: `split-product-${index + 1}`,
                  ratio: 2,
                }
              : { hasSplit: false as const },
        },
      })),
    });
    const moveInTransaction = makeTransaction({
      _id: 'move-in-1',
      ptrId: 'ptr-1',
      journal: 'invMoveIn',
      branchId: 'destination-branch',
      departmentId: 'destination-department',
      details: Array.from({ length: 5 }, (_, index) => ({
        _id: `move-in-detail-${index + 1}`,
        originId: `detail-${index + 1}`,
        accountId: 'destination-account',
        productId: `source-product-${index + 1}`,
        count: index + 1,
        unitPrice: 100,
        amount: (index + 1) * 100,
      })),
    });

    const followDocs = buildInvSplitFollowDocs(
      originTransaction,
      moveInTransaction,
      'split-ptr',
    );

    expect(originTransaction.details).toHaveLength(5);
    expect(moveInTransaction.details).toHaveLength(5);
    expect(originTransaction.ptrId).toBe('ptr-1');
    expect(moveInTransaction.ptrId).toBe('ptr-1');
    expect(followDocs).toHaveLength(2);
    expect(followDocs.map((followDoc) => followDoc.ptrId)).toEqual([
      'split-ptr',
      'split-ptr',
    ]);
    expect(followDocs.every((followDoc) => followDoc.ptrId !== 'ptr-1')).toBe(
      true,
    );
    expect(followDocs[0].details).toHaveLength(3);
    expect(followDocs[1].details).toHaveLength(3);
    expect(followDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          branchId: 'destination-branch',
          departmentId: 'destination-department',
        }),
      ]),
    );
    expect(
      followDocs.every((followDoc) =>
        followDoc.details.every(
          (detail) => detail.accountId === 'destination-account',
        ),
      ),
    ).toBe(true);
  });

  it('normalizes legacy root split settings into detail state', () => {
    const transaction = makeTransaction({
      details: [
        {
          _id: 'detail-1',
          accountId: 'inventory-account',
          productId: 'source-product',
          count: 2,
          unitPrice: 120,
          amount: 240,
        },
      ],
      followInfos: {
        invSplitDetails: [
          {
            detailId: 'detail-1',
            productId: 'split-product',
            ratio: 3,
          },
        ],
      },
    });

    const normalized = normalizeInvSplitTransaction(transaction);

    expect(normalized.followInfos.invSplitDetails).toBeUndefined();
    expect(normalized.details[0].followInfos.invSplit).toEqual({
      hasSplit: true,
      productId: 'split-product',
      ratio: 3,
    });
  });

  it('removes duplicate generated transactions before synchronizing', async () => {
    const originTransaction = makeTransaction();
    const oldOut = makeTransaction({
      _id: 'old-out',
      ptrId: 'split-ptr',
      originType: 'invSplitOut',
    });
    const duplicateOut = makeTransaction({
      _id: 'duplicate-out',
      ptrId: 'duplicate-ptr',
      originType: 'invSplitOut',
    });
    const oldIncome = makeTransaction({
      _id: 'old-income',
      ptrId: 'split-ptr',
      originType: 'invSplitIncome',
    });
    const deleteMany = jest.fn();
    const models = {
      Transactions: {
        find: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([oldOut, duplicateOut, oldIncome]),
        }),
        deleteMany,
      },
    } as unknown as IModels;

    jest
      .mocked(createOrUpdateTr)
      .mockImplementation(
        async (_models, _userId, doc, oldTransaction) =>
          ({ ...doc, _id: oldTransaction?._id || 'new-follow' }) as never,
      );

    await syncInvSplitFollowTrs(
      'tenant',
      models,
      'user-1',
      originTransaction,
      originTransaction,
    );

    expect(removeSyncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      duplicateOut,
      -1,
    );
    expect(deleteMany).toHaveBeenCalledWith({
      _id: { $in: ['duplicate-out'] },
    });
    expect(createOrUpdateTr).toHaveBeenCalledTimes(2);
    expect(syncProductsInventory).toHaveBeenCalledTimes(2);
    expect(
      jest.mocked(createOrUpdateTr).mock.calls.map((call) => call[2].ptrId),
    ).toEqual(['split-ptr', 'split-ptr']);
  });
});
