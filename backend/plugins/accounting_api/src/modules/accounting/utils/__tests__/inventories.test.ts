/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES } from '../../@types/constants';
import { adjustRunning, fixRelatedMainJournal } from '../inventories';

const queryResult = <T>(value: T) => ({
  lean: jest.fn().mockResolvedValue(value),
});

const makeModels = (transactions: Record<string, unknown>[] = []) =>
  ({
    Transactions: {
      find: jest.fn().mockReturnValue(queryResult(transactions)),
      updateOne: jest.fn().mockResolvedValue(undefined),
    },
  }) as unknown as IModels;

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
  });
});
