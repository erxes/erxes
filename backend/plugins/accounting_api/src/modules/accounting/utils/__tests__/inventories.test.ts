/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES, TR_STATUSES } from '../../@types/constants';
import {
  activeCost,
  adjustRunning,
  fixRelatedMainJournal,
} from '../inventories';

const queryResult = <T>(value: T) => ({
  lean: jest.fn().mockResolvedValue(value),
});

const makeModels = (transactions: Record<string, unknown>[] = []) =>
  ({
    Transactions: {
      find: jest.fn().mockReturnValue(queryResult(transactions)),
      updateOne: jest.fn().mockResolvedValue(undefined),
    },
  } as unknown as IModels);

describe('activeCost', () => {
  it('adds active inventory movements after the latest published adjustment', async () => {
    const adjustDate = new Date('2026-01-10T00:00:00.000Z');
    const adjustSort = jest.fn().mockReturnValue(
      queryResult({
        _id: 'adjust-latest',
        date: adjustDate,
      }),
    );
    const transactionAggregate = jest
      .fn()
      .mockResolvedValueOnce([
        { _id: 'product-a', remainder: 5, cost: 60 },
        { _id: 'product-b', remainder: 2, cost: 30 },
      ])
      .mockResolvedValueOnce([{ _id: 'product-a', remainder: 2, cost: 12 }]);
    const models = {
      AdjustInventories: {
        findOne: jest.fn().mockReturnValue({ sort: adjustSort }),
      },
      AdjustInvDetails: {
        find: jest.fn().mockReturnValue(
          queryResult([
            {
              productId: 'product-a',
              remainder: 7,
              cost: 70,
              unitCost: 10,
            },
          ]),
        ),
      },
      Transactions: {
        aggregate: transactionAggregate,
      },
    };

    const result = await activeCost(
      models as unknown as IModels,
      'inventory-account',
      'branch-a',
      'department-a',
      ['product-a', 'product-b'],
      ['old-sale-out'],
    );

    expect(models.AdjustInventories.findOne).toHaveBeenCalledWith({
      status: 'publish',
    });
    expect(adjustSort).toHaveBeenCalledWith({
      date: -1,
      createdAt: -1,
      _id: -1,
    });
    expect(models.AdjustInvDetails.find).toHaveBeenCalledWith({
      adjustId: 'adjust-latest',
      accountId: 'inventory-account',
      branchId: 'branch-a',
      departmentId: 'department-a',
      productId: { $in: ['product-a', 'product-b'] },
    });
    expect(transactionAggregate).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([
        {
          $match: expect.objectContaining({
            date: { $gt: adjustDate },
            journal: { $in: JOURNALS.ALL_REAL_INV },
            status: { $in: TR_STATUSES.ACTIVE },
            _id: { $nin: ['old-sale-out'] },
            side: TR_SIDES.DEBIT,
          }),
        },
        {
          $addFields: {
            locationBranchId: {
              $cond: [
                {
                  $gt: [
                    {
                      $strLenCP: { $ifNull: ['$details.branchId', ''] },
                    },
                    0,
                  ],
                },
                '$details.branchId',
                {
                  $cond: [
                    {
                      $gt: [{ $strLenCP: { $ifNull: ['$branchId', ''] } }, 0],
                    },
                    '$branchId',
                    '_',
                  ],
                },
              ],
            },
            locationDepartmentId: {
              $cond: [
                {
                  $gt: [
                    {
                      $strLenCP: { $ifNull: ['$details.departmentId', ''] },
                    },
                    0,
                  ],
                },
                '$details.departmentId',
                {
                  $cond: [
                    {
                      $gt: [
                        { $strLenCP: { $ifNull: ['$departmentId', ''] } },
                        0,
                      ],
                    },
                    '$departmentId',
                    '_',
                  ],
                },
              ],
            },
          },
        },
        {
          $match: expect.objectContaining({
            locationBranchId: 'branch-a',
            locationDepartmentId: 'department-a',
          }),
        },
      ]),
    );
    expect(transactionAggregate).toHaveBeenNthCalledWith(
      2,
      expect.arrayContaining([
        {
          $match: expect.objectContaining({
            side: TR_SIDES.CREDIT,
          }),
        },
        {
          $group: {
            _id: '$details.productId',
            remainder: { $sum: { $ifNull: ['$details.count', 0] } },
            cost: { $sum: { $ifNull: ['$details.amount', 0] } },
          },
        },
      ]),
    );
    expect(result).toEqual({
      'product-a': { totalCost: 118, unitCost: 11.8, remainder: 10 },
      'product-b': { totalCost: 30, unitCost: 15, remainder: 2 },
    });
  });

  it('calculates from all active movements when no adjustment is published', async () => {
    const transactionAggregate = jest
      .fn()
      .mockResolvedValueOnce([{ _id: 'product-a', remainder: 5, cost: 65 }])
      .mockResolvedValueOnce([{ _id: 'product-a', remainder: 1, cost: 13 }]);
    const models = {
      AdjustInventories: {
        findOne: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue(queryResult(null)),
        }),
      },
      AdjustInvDetails: {
        find: jest.fn(),
      },
      Transactions: {
        aggregate: transactionAggregate,
      },
    };

    const result = await activeCost(
      models as unknown as IModels,
      'inventory-account',
      undefined,
      undefined,
      ['product-a'],
    );

    expect(models.AdjustInvDetails.find).not.toHaveBeenCalled();
    expect(transactionAggregate.mock.calls[0][0][0].$match).not.toHaveProperty(
      'date',
    );
    expect(transactionAggregate).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      'product-a': { totalCost: 52, unitCost: 13, remainder: 4 },
    });
  });
});

describe('fixRelatedMainJournal', () => {
  it('updates a related main debit detail by the inventory out cost diff', async () => {
    const models = makeModels([
      {
        _id: 'related-main-tr',
        ptrId: 'ptr-1',
        journal: JOURNALS.MAIN,
        side: TR_SIDES.DEBIT,
        sumDt: 100,
        details: [
          {
            _id: 'main-detail',
            accountId: 'expense-account',
            amount: 100,
          },
        ],
      },
    ]);

    const trIds = await fixRelatedMainJournal(models, {
      ptrId: 'ptr-1',
      excludeTrId: 'inv-out-tr',
      oldAmount: 100,
      newAmount: 140,
    });

    expect(trIds).toEqual(['related-main-tr']);
    expect(models.Transactions.find).toHaveBeenCalledWith({
      ptrId: 'ptr-1',
      _id: { $ne: 'inv-out-tr' },
      side: TR_SIDES.DEBIT,
      journal: {
        $in: [JOURNALS.MAIN, JOURNALS.RECEIVABLE, JOURNALS.PAYABLE],
      },
    });
    expect(models.Transactions.updateOne).toHaveBeenCalledWith(
      { _id: 'related-main-tr' },
      {
        $set: {
          'details.$[d].amount': 140,
        },
      },
      { arrayFilters: [{ 'd._id': { $eq: 'main-detail' } }] },
    );
  });

  it('leaves explicit cash and bank debit amounts unchanged', async () => {
    const models = makeModels([]);

    const trIds = await fixRelatedMainJournal(models, {
      ptrId: 'ptr-1',
      excludeTrId: 'inv-out-tr',
      oldAmount: 100,
      newAmount: 140,
    });

    expect(trIds).toEqual([]);
    expect(models.Transactions.updateOne).not.toHaveBeenCalled();
    expect(models.Transactions.find).toHaveBeenCalledWith(
      expect.objectContaining({
        side: TR_SIDES.DEBIT,
        journal: {
          $in: [JOURNALS.MAIN, JOURNALS.RECEIVABLE, JOURNALS.PAYABLE],
        },
      }),
    );
  });
});

describe('adjustRunning', () => {
  it('groups inventory costs by detail location before falling back to transaction location', async () => {
    const aggregate = jest.fn().mockResolvedValue([]);
    const models = {
      Transactions: {
        aggregate,
        findOne: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue(queryResult(null)),
        }),
      },
      AdjustInventories: {
        updateAdjustInventory: jest.fn().mockResolvedValue(undefined),
        getAdjustInventory: jest.fn().mockResolvedValue({
          _id: 'adj-a',
          date: new Date('2026-01-02T00:00:00.000Z'),
        }),
      },
      AdjustInvDetails: {
        find: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
          countDocuments: jest.fn().mockResolvedValue(0),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
        }),
        updateOne: jest.fn().mockResolvedValue(undefined),
        deleteMany: jest.fn().mockResolvedValue(undefined),
        bulkWrite: jest.fn().mockResolvedValue(undefined),
      },
    };

    await adjustRunning(
      'test',
      models as unknown as IModels,
      { _id: 'user-a' } as never,
      {
        adjustInventory: {
          _id: 'adj-a',
          date: new Date('2026-01-02T00:00:00.000Z'),
          description: '',
          status: 'draft',
          beginDate: new Date('2025-12-30T00:00:00.000Z'),
          successDate: new Date('2025-12-31T00:00:00.000Z'),
          checkedAt: new Date('2026-01-01T00:00:00.000Z'),
        } as never,
        beginDate: new Date('2025-12-30T00:00:00.000Z'),
      },
    );

    expect(
      models.AdjustInventories.updateAdjustInventory,
    ).not.toHaveBeenCalledWith(
      'adj-a',
      expect.objectContaining({
        checkedDate: expect.any(Date),
        error: expect.any(String),
      }),
    );
    expect(aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $addFields: expect.objectContaining({
            locationBranchId: expect.any(Object),
            locationDepartmentId: expect.any(Object),
          }),
        }),
        expect.objectContaining({
          $group: expect.objectContaining({
            _id: expect.objectContaining({
              branchId: '$locationBranchId',
              departmentId: '$locationDepartmentId',
            }),
          }),
        }),
      ]),
    );
    expect(aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          $match: expect.objectContaining({
            journal: JOURNALS.INV_JUSTIFY,
            side: TR_SIDES.DEBIT,
          }),
        },
      ]),
    );
    expect(aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          $match: expect.objectContaining({
            journal: JOURNALS.INV_JUSTIFY,
            side: TR_SIDES.CREDIT,
          }),
        },
      ]),
    );
  });
});
