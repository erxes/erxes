/// <reference types="jest" />

import { ADJ_FXA_STATUSES } from '../../@types/adjustFixedAsset';
import { JOURNALS, TR_STATUSES } from '../../@types/constants';
import {
  FXA_LOG_EVENT_TYPES,
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
} from '@/fixedAssets/@types/constants';
import { getFxaDisposalSummaries } from '../fixedAssets';
import { runAdjustFixedAsset } from '../adjustFixedAssets';
import { syncFxaIncomeDetails } from '../fxaIncome';
import {
  createFxaDisposalFollowTrs,
  syncFxaDisposalInstances,
} from '../fxaOut';
import { createFxaMoveInFollowTr } from '../fxaMove';

type TQuery<T> = {
  lean: jest.Mock<Promise<T>, []>;
  sort: jest.Mock<TQuery<T>, [Record<string, unknown>]>;
  select: jest.Mock<TQuery<T>, [Record<string, unknown>]>;
};

const queryResult = <T>(value: T): TQuery<T> => {
  const query = {
    lean: jest.fn(async () => value),
    sort: jest.fn(() => query),
    select: jest.fn(() => query),
  };

  return query;
};

const makeIncomeTransaction = (overrides: Record<string, unknown> = {}) => ({
  _id: 'tr-income',
  date: new Date('2026-01-01T00:00:00.000Z'),
  journal: JOURNALS.FXA_INCOME,
  status: TR_STATUSES.COMPLETE,
  branchId: 'branch-a',
  departmentId: 'dept-a',
  details: [
    {
      _id: 'detail-income',
      accountId: 'asset-account',
      fixedAssetCategoryId: 'cat-a',
      fixedAssetCode: 'DELL-001',
      fixedAssetName: 'Dell laptop',
      count: 3,
      unitPrice: 500,
      amount: 1500,
      followInfos: {
        salvageValue: 50,
      },
    },
  ],
  followInfos: {
    fxaIncomeDetails: [
      {
        tempId: 'detail-income',
        transactionDetailId: 'detail-income',
        salvageValue: 50,
        openingAccumulatedDepreciation: 20,
      },
    ],
  },
  extraData: {},
  ...overrides,
});

const makeModels = () => {
  const models = {
    FixedAssetCategories: {
      find: jest.fn(() =>
        queryResult([
          {
            _id: 'cat-a',
            depreciationMethod: 'straightLine',
            defaultUsefulLife: 10,
            defaultSalvageValue: 50,
            taxDepreciationMethod: 'straightLine',
            defaultTaxUsefulLife: 10,
            defaultTaxSalvageValue: 0,
          },
        ]),
      ),
    },
    FixedAssets: {
      find: jest.fn(() => queryResult([])),
      findOne: jest.fn(() => queryResult(null)),
      create: jest.fn(async (doc: Record<string, unknown>) => ({
        _id: 'asset-a',
        ...doc,
      })),
      updateOne: jest.fn(async () => undefined),
      deleteMany: jest.fn(async () => undefined),
    },
    FxaOwnerRecords: {
      deleteMany: jest.fn(async () => undefined),
      insertMany: jest.fn(async () => undefined),
      updateOne: jest.fn(async () => undefined),
      find: jest.fn(() => queryResult([])),
      findByIds: jest.fn(async () => []),
      listByFilter: jest.fn(async () => []),
    },
    AdjustFixedAssets: {
      findOne: jest.fn((selector: Record<string, unknown>) => {
        if (selector.status && selector.date) {
          return queryResult(null);
        }

        return queryResult(null);
      }),
      updateOne: jest.fn(async () => undefined),
      deleteOne: jest.fn(async () => undefined),
      updateAdjustFixedAsset: jest.fn(async (_id: string, doc) => doc),
    },
    AdjustFxaDetails: {
      find: jest.fn(() => queryResult([])),
      findOne: jest.fn(() => queryResult(null)),
      replaceAdjustFxaDetails: jest.fn(async () => undefined),
      deleteMany: jest.fn(async () => undefined),
    },
    Transactions: {
      find: jest.fn(() => queryResult([])),
      findOne: jest.fn(() => queryResult(null)),
      updateOne: jest.fn(async () => undefined),
      createTransaction: jest.fn(async (doc: Record<string, unknown>) => ({
        _id: `follow-${doc.originType || doc.journal}`,
        ...doc,
      })),
      updateTransaction: jest.fn(async (_id: string, doc) => ({
        _id,
        ...doc,
      })),
      deleteMany: jest.fn(async () => undefined),
    },
  };

  return models;
};

describe('fixed asset income', () => {
  it('creates the fixed asset from income detail and keeps owner records optional', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction();

    models.FixedAssets.find.mockReturnValueOnce(queryResult([]));
    models.Transactions.find.mockReturnValue(
      queryResult([
        {
          _id: transaction._id,
          journal: JOURNALS.FXA_INCOME,
          status: TR_STATUSES.COMPLETE,
          details: [{ fixedAssetId: 'asset-a', count: 3 }],
        },
      ]),
    );

    await syncFxaIncomeDetails(models as never, 'user-a', transaction as never);

    expect(models.FixedAssets.create).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'DELL-001',
        name: 'Dell laptop',
        categoryId: 'cat-a',
        accountId: 'asset-account',
        count: 3,
        currentCount: 3,
        originalCost: 500,
        salvageValue: 50,
        transactionId: 'tr-income',
        transactionDetailId: 'detail-income',
      }),
    );
    expect(transaction.details[0].fixedAssetId).toBe('asset-a');
    expect(models.FxaOwnerRecords.insertMany).not.toHaveBeenCalled();
    expect(
      models.AdjustFxaDetails.replaceAdjustFxaDetails,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        adjustId: 'fxa-opening:tr-income',
        details: [
          expect.objectContaining({
            fixedAssetId: 'asset-a',
            originalCost: 1500,
            salvageValue: 150,
            openingAccumulatedDepreciation: 60,
            closingAccumulatedDepreciation: 60,
          }),
        ],
      }),
    );
  });

  it('reuses one fixed asset for income details with the same acquisition code', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction({
      details: [
        {
          _id: 'detail-branch-a',
          accountId: 'asset-account',
          fixedAssetCategoryId: 'cat-a',
          fixedAssetCode: 'DELL-001',
          fixedAssetName: 'Dell laptop',
          branchId: 'branch-a',
          departmentId: 'dept-a',
          count: 3,
          unitPrice: 500,
          amount: 1500,
          followInfos: {
            fixedAssetTotalCount: 5,
            fixedAssetTotalAmount: 2500,
          },
        },
        {
          _id: 'detail-branch-b',
          accountId: 'asset-account',
          fixedAssetCategoryId: 'cat-a',
          fixedAssetCode: 'DELL-001',
          fixedAssetName: 'Dell laptop',
          branchId: 'branch-b',
          departmentId: 'dept-b',
          count: 2,
          unitPrice: 500,
          amount: 1000,
          followInfos: {
            fixedAssetTotalCount: 5,
            fixedAssetTotalAmount: 2500,
          },
        },
      ],
      followInfos: {
        fxaIncomeDetails: [],
      },
    });

    models.FixedAssets.find.mockReturnValue(queryResult([]));
    models.Transactions.find.mockReturnValue(queryResult([transaction]));

    await syncFxaIncomeDetails(models as never, 'user-a', transaction as never);

    expect(models.FixedAssets.create).toHaveBeenCalledTimes(1);
    expect(models.FixedAssets.create).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 5,
        originalCost: 500,
      }),
    );
    expect(transaction.details.map((detail) => detail.fixedAssetId)).toEqual([
      'asset-a',
      'asset-a',
    ]);
  });

  it('creates owner records only for the allocated rows sent by the form', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction({
      details: [
        {
          _id: 'detail-income',
          accountId: 'asset-account',
          fixedAssetCategoryId: 'cat-a',
          fixedAssetCode: 'DELL-001',
          fixedAssetName: 'Dell laptop',
          count: 10,
          unitPrice: 500,
          amount: 5000,
        },
      ],
      extraData: {
        fxaOwnerRecords: [
          {
            tempId: 'owner-1',
            transactionDetailId: 'detail-income',
            code: 'DELL-001_001',
            sequence: 1,
            count: 1,
            ownerId: 'user-owner-a',
          },
          {
            tempId: 'owner-2',
            transactionDetailId: 'detail-income',
            code: 'DELL-001_002',
            sequence: 2,
            count: 2,
            ownerId: 'user-owner-b',
          },
        ],
      },
    });

    models.FixedAssets.find.mockReturnValueOnce(queryResult([]));

    await syncFxaIncomeDetails(models as never, 'user-a', transaction as never);

    expect(models.FxaOwnerRecords.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        fixedAssetId: 'asset-a',
        code: 'DELL-001_001',
        sequence: 1,
        count: 1,
        action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
        ownerId: 'user-owner-a',
        transactionId: 'tr-income',
        transactionDetailId: 'detail-income',
      }),
      expect.objectContaining({
        fixedAssetId: 'asset-a',
        code: 'DELL-001_002',
        sequence: 2,
        count: 2,
        action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
        ownerId: 'user-owner-b',
        transactionId: 'tr-income',
        transactionDetailId: 'detail-income',
      }),
    ]);
  });

  it('rejects income owner record counts above detail count', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction({
      extraData: {
        fxaOwnerRecords: [
          {
            tempId: 'owner-1',
            transactionDetailId: 'detail-income',
            code: 'DELL-001_001',
            sequence: 1,
            count: 4,
            ownerId: 'user-owner-a',
          },
        ],
      },
    });

    models.FixedAssets.find.mockReturnValueOnce(queryResult([]));

    await expect(
      syncFxaIncomeDetails(models as never, 'user-a', transaction as never),
    ).rejects.toThrow(
      'Fixed asset owner record count must not exceed detail count',
    );
  });

  it('creates owner records from transaction owner when no explicit owner rows are sent', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction({
      followInfos: {
        ownerId: 'user-owner-a',
        fxaIncomeDetails: [
          {
            tempId: 'detail-income',
            transactionDetailId: 'detail-income',
            salvageValue: 50,
          },
        ],
      },
    });

    models.FixedAssets.find.mockReturnValueOnce(queryResult([]));

    await syncFxaIncomeDetails(models as never, 'user-a', transaction as never);

    expect(models.FxaOwnerRecords.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        fixedAssetId: 'asset-a',
        count: 3,
        action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
        ownerId: 'user-owner-a',
        transactionId: 'tr-income',
        transactionDetailId: 'detail-income',
      }),
    ]);
  });
});

describe('fixed asset owner records', () => {
  it('allows selected owner record count below detail count', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'out-a',
      journal: JOURNALS.FXA_OUT,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-02-01T00:00:00.000Z'),
      followInfos: {},
      extraData: {
        fxaOwnerRecords: [
          {
            tempId: 'owner-out',
            transactionDetailId: 'detail-out',
            fixedAssetId: 'asset-a',
            count: 3,
            ownerId: 'user-owner-a',
          },
        ],
      },
      details: [{ _id: 'detail-out', fixedAssetId: 'asset-a', count: 5 }],
    };

    models.FxaOwnerRecords.find.mockReturnValue(
      queryResult([
        {
          _id: 'owner-in',
          fixedAssetId: 'asset-a',
          ownerId: 'user-owner-a',
          count: 5,
          action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
          status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
        },
      ]),
    );
    models.Transactions.find.mockReturnValue(queryResult([]));

    await syncFxaDisposalInstances(
      models as never,
      'user-a',
      transaction as never,
      FXA_LOG_EVENT_TYPES.DISPOSAL,
      FXA_OWNER_RECORD_STATUSES.INACTIVE,
    );

    expect(models.FxaOwnerRecords.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        fixedAssetId: 'asset-a',
        count: 3,
        action: FXA_OWNER_RECORD_ACTIONS.HANDED_OVER,
        ownerId: 'user-owner-a',
        transactionId: 'out-a',
        transactionDetailId: 'detail-out',
      }),
    ]);
  });

  it('rejects selected owner record count above detail count', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'out-a',
      journal: JOURNALS.FXA_OUT,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-02-01T00:00:00.000Z'),
      followInfos: {},
      extraData: {
        fxaOwnerRecords: [
          {
            tempId: 'owner-out',
            transactionDetailId: 'detail-out',
            fixedAssetId: 'asset-a',
            count: 6,
            ownerId: 'user-owner-a',
          },
        ],
      },
      details: [{ _id: 'detail-out', fixedAssetId: 'asset-a', count: 5 }],
    };

    await expect(
      syncFxaDisposalInstances(
        models as never,
        'user-a',
        transaction as never,
        FXA_LOG_EVENT_TYPES.DISPOSAL,
        FXA_OWNER_RECORD_STATUSES.INACTIVE,
      ),
    ).rejects.toThrow(
      'Selected owner record count must not exceed detail count',
    );
  });

  it('creates handed-over owner records from transaction owner when no sheet rows are sent', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'out-a',
      journal: JOURNALS.FXA_OUT,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-02-01T00:00:00.000Z'),
      followInfos: {
        ownerId: 'user-owner-a',
      },
      extraData: {},
      details: [{ _id: 'detail-out', fixedAssetId: 'asset-a', count: 2 }],
    };

    models.FxaOwnerRecords.find.mockReturnValue(
      queryResult([
        {
          _id: 'owner-in',
          fixedAssetId: 'asset-a',
          ownerId: 'user-owner-a',
          count: 3,
          action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
          status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
        },
      ]),
    );
    models.Transactions.find.mockReturnValue(queryResult([]));

    await syncFxaDisposalInstances(
      models as never,
      'user-a',
      transaction as never,
      FXA_LOG_EVENT_TYPES.DISPOSAL,
      FXA_OWNER_RECORD_STATUSES.INACTIVE,
    );

    expect(models.FxaOwnerRecords.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        fixedAssetId: 'asset-a',
        count: 2,
        action: FXA_OWNER_RECORD_ACTIONS.HANDED_OVER,
        ownerId: 'user-owner-a',
        transactionId: 'out-a',
        transactionDetailId: 'detail-out',
      }),
    ]);
  });
});

describe('fixed asset move follow transaction', () => {
  it('allows department-only move destinations', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'move-a',
      journal: JOURNALS.FXA_MOVE,
      status: TR_STATUSES.COMPLETE,
      parentId: 'move-a',
      date: new Date('2026-01-03T00:00:00.000Z'),
      branchId: 'branch-a',
      departmentId: '',
      followInfos: {
        moveInDepartmentId: 'dept-call-center',
      },
      details: [
        {
          _id: 'detail-move',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          count: 1,
          unitPrice: 100,
          amount: 100,
        },
      ],
    };

    models.Transactions.find.mockReturnValue(queryResult([]));

    await createFxaMoveInFollowTr(
      models as never,
      'user-a',
      transaction as never,
    );

    expect(models.Transactions.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_MOVE_IN,
        branchId: undefined,
        departmentId: 'dept-call-center',
      }),
      'user-a',
    );
  });

  it('rejects move destinations without branch and department', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'move-a',
      journal: JOURNALS.FXA_MOVE,
      status: TR_STATUSES.COMPLETE,
      followInfos: {},
      details: [],
    };

    await expect(
      createFxaMoveInFollowTr(models as never, 'user-a', transaction as never),
    ).rejects.toThrow('Move destination branch or department is required');
  });
});

describe('fixed asset adjustment', () => {
  it('calculates depreciation from transaction detail movements by day and location', async () => {
    const models = makeModels();
    const fixedAsset = {
      _id: 'asset-a',
      code: 'DELL-001',
      name: 'Dell laptop',
      categoryId: 'cat-a',
      accountId: 'asset-account',
      count: 4,
      currentCount: 4,
      originalCost: 1200,
      salvageValue: 0,
      usefulLife: 12,
      depreciationMethod: 'straightLine',
      acquisitionDate: new Date('2026-01-01T00:00:00.000Z'),
      depreciationStartDate: new Date('2026-01-01T00:00:00.000Z'),
    };
    const incomeTransaction = {
      _id: 'tr-income',
      journal: JOURNALS.FXA_INCOME,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-01-01T00:00:00.000Z'),
      branchId: 'branch-a',
      departmentId: 'dept-a',
      details: [
        {
          _id: 'detail-income',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          count: 4,
          unitPrice: 1200,
        },
      ],
    };
    const moveOutTransaction = {
      _id: 'tr-move',
      journal: JOURNALS.FXA_MOVE,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-01-03T00:00:00.000Z'),
      branchId: 'branch-a',
      departmentId: 'dept-a',
      details: [
        {
          _id: 'detail-move-out',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          count: 2,
        },
      ],
    };
    const moveInTransaction = {
      _id: 'tr-move-in',
      journal: JOURNALS.FXA_MOVE_IN,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-01-03T00:00:00.000Z'),
      branchId: 'branch-b',
      departmentId: 'dept-b',
      details: [
        {
          _id: 'detail-move-in',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          count: 2,
        },
      ],
    };

    models.FixedAssets.find.mockReturnValue(queryResult([fixedAsset]));
    models.Transactions.findOne.mockImplementation(
      (selector: Record<string, unknown>) => {
        if (selector.journal === JOURNALS.FXA_INCOME) {
          return queryResult(incomeTransaction);
        }

        return queryResult(null);
      },
    );
    models.Transactions.find.mockReturnValue(
      queryResult([incomeTransaction, moveOutTransaction, moveInTransaction]),
    );

    await runAdjustFixedAsset(models as never, 'user-a', {
      _id: 'adjust-a',
      date: new Date('2026-01-04T00:00:00.000Z'),
    } as never);

    const replaceCall =
      models.AdjustFxaDetails.replaceAdjustFxaDetails.mock.calls.at(-1)?.[0];

    expect(replaceCall).toEqual(
      expect.objectContaining({
        adjustId: 'adjust-a',
        details: expect.arrayContaining([
          expect.objectContaining({
            fixedAssetId: 'asset-a',
            branchId: 'branch-a',
            departmentId: 'dept-a',
            originalCost: 2400,
            depreciationAmount: expect.any(Number),
          }),
          expect.objectContaining({
            fixedAssetId: 'asset-a',
            branchId: 'branch-b',
            departmentId: 'dept-b',
            originalCost: 2400,
            depreciationAmount: expect.any(Number),
          }),
        ]),
      }),
    );
    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith(
      'adjust-a',
      expect.objectContaining({
        status: ADJ_FXA_STATUSES.PROCESS,
        error: '',
      }),
    );
  });

  it('stops on the first day with an incomplete fixed asset transaction', async () => {
    const models = makeModels();
    const fixedAsset = {
      _id: 'asset-a',
      categoryId: 'cat-a',
      accountId: 'asset-account',
      count: 1,
      originalCost: 1200,
      usefulLife: 12,
      depreciationMethod: 'straightLine',
      acquisitionDate: new Date('2026-01-01T00:00:00.000Z'),
    };

    models.FixedAssets.find.mockReturnValue(queryResult([fixedAsset]));
    models.Transactions.findOne.mockImplementation(
      (selector: Record<string, unknown>) => {
        if (selector.journal === JOURNALS.FXA_INCOME) {
          return queryResult({
            _id: 'tr-income',
            date: new Date('2026-01-01T00:00:00.000Z'),
          });
        }

        if (selector.status) {
          return queryResult({
            _id: 'tr-draft',
            number: '20260102_001',
            status: TR_STATUSES.DRAFT,
          });
        }

        return queryResult(null);
      },
    );
    models.Transactions.find.mockReturnValue(
      queryResult([
        {
          _id: 'tr-income',
          journal: JOURNALS.FXA_INCOME,
          status: TR_STATUSES.COMPLETE,
          date: new Date('2026-01-01T00:00:00.000Z'),
          details: [{ fixedAssetId: 'asset-a', count: 1 }],
        },
      ]),
    );

    await runAdjustFixedAsset(models as never, 'user-a', {
      _id: 'adjust-a',
      date: new Date('2026-01-03T00:00:00.000Z'),
    } as never);

    expect(
      models.AdjustFxaDetails.replaceAdjustFxaDetails,
    ).toHaveBeenCalledWith({ adjustId: 'adjust-a', details: [] });
    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith(
      'adjust-a',
      expect.objectContaining({
        status: ADJ_FXA_STATUSES.PROCESS,
        error: expect.stringContaining('20260102_001'),
      }),
    );
  });
});

describe('fixed asset sale and disposal summaries', () => {
  it('summarizes disposal from fixed asset cost base and latest adjustment cache', async () => {
    const models = makeModels();

    models.FixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'asset-a',
          originalCost: 500,
          count: 4,
          currentCount: 2,
        },
      ]),
    );
    models.AdjustFxaDetails.find.mockReturnValue(
      queryResult([
        {
          adjustId: 'adjust-a',
          fixedAssetId: 'asset-a',
          closingAccumulatedDepreciation: 200,
          closingBookValue: 1800,
        },
      ]),
    );

    const summaries = await getFxaDisposalSummaries(
      models as never,
      {
        _id: 'sale-a',
        journal: JOURNALS.FXA_SALE,
        details: [{ _id: 'detail-sale', fixedAssetId: 'asset-a', count: 2 }],
      } as never,
    );

    expect(summaries).toEqual([
      {
        detailId: 'detail-sale',
        fixedAssetId: 'asset-a',
        count: 2,
        originalCost: 1000,
        accumulatedDepreciation: 100,
        bookValue: 900,
      },
    ]);
  });

  it('creates sale follow transactions for cost, accumulated depreciation, and book value', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'sale-a',
      journal: JOURNALS.FXA_SALE,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-02-01T00:00:00.000Z'),
      branchId: 'branch-a',
      departmentId: 'dept-a',
      followInfos: {
        fixedAssetAccountId: 'asset-account',
        accumulatedDepreciationAccountId: 'acc-dep-account',
        lossAccountId: 'loss-account',
      },
      details: [{ _id: 'detail-sale', fixedAssetId: 'asset-a', count: 1 }],
    };

    models.FixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'asset-a',
          originalCost: 500,
          count: 2,
          currentCount: 1,
        },
      ]),
    );
    models.AdjustFxaDetails.find.mockReturnValue(
      queryResult([
        {
          adjustId: 'adjust-a',
          fixedAssetId: 'asset-a',
          closingAccumulatedDepreciation: 100,
          closingBookValue: 900,
        },
      ]),
    );

    const followTrs = await createFxaDisposalFollowTrs(
      models as never,
      'user-a',
      transaction as never,
    );

    expect(followTrs).toHaveLength(3);
    expect(models.Transactions.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_OUT_COST,
        side: 'ct',
        details: [
          expect.objectContaining({
            fixedAssetId: 'asset-a',
            accountId: 'asset-account',
            amount: 500,
          }),
        ],
      }),
      'user-a',
    );
    expect(models.Transactions.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_OUT_DEPRECIATION,
        details: [
          expect.objectContaining({
            accountId: 'acc-dep-account',
            amount: 50,
          }),
        ],
      }),
      'user-a',
    );
    expect(models.Transactions.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_OUT_LOSS,
        details: [
          expect.objectContaining({
            accountId: 'loss-account',
            amount: 450,
          }),
        ],
      }),
      'user-a',
    );
  });
});
