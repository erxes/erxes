/// <reference types="jest" />

import { ITransactionDocument } from '../../@types/transaction';
import { buildInvSplitFollowDocs } from '../invSplit';

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
  } as ITransactionDocument);

describe('inventory split follow transactions', () => {
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

  it('groups only enabled split details under a separate pointer', () => {
    const transaction = makeTransaction({
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

    const followDocs = buildInvSplitFollowDocs(
      transaction,
      transaction,
      'split-ptr',
    );

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
  });
});
