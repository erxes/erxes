/// <reference types="jest" />

import { ADJ_FXA_STATUSES } from '../../@types/adjustFixedAsset';
import {
  JOURNALS,
  TR_FOLLOW_TYPES,
  TR_SIDES,
  TR_STATUSES,
} from '../../@types/constants';
import {
  FXA_LOG_EVENT_TYPES,
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
} from '@/fixedAssets/@types/constants';
import {
  assignMissingFxaOwnerRecordSequences,
  getFxaDisposalSummaries,
} from '../fixedAssets';
import { runAdjustFixedAsset } from '../adjustFixedAssets';
import { removeFxaIncomeDetails, syncFxaIncomeDetails } from '../fxaIncome';
import {
  createFxaDisposalFollowTrs,
  syncFxaDisposalInstances,
} from '../fxaOut';
import {
  createFxaMoveDepreciationFollowTrs,
  createFxaMoveInFollowTr,
} from '../fxaMove';

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
        preDeprecation: 20,
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
            defaultAnnualDepreciationRate: 10,
            defaultSalvageValue: 50,
            taxDepreciationMethod: 'straightLine',
            defaultTaxAnnualDepreciationRate: 10,
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
      find: jest.fn(() =>
        queryResult([
          {
            _id: 'adjust-a',
            date: new Date('2026-01-31T00:00:00.000Z'),
            status: ADJ_FXA_STATUSES.PUBLISH,
          },
        ]),
      ),
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
    Configs: {
      getConfigs: jest.fn(async () => [
        {
          subId: 'asset-account',
          value: { depreciationAccountId: 'acc-dep-account' },
        },
      ]),
    },
  };

  return models;
};

describe('fixed asset income', () => {
  it('creates the fixed asset from income detail and keeps owner records optional', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction();

    models.FixedAssets.find.mockReturnValueOnce(queryResult([]));
    models.Transactions.find.mockImplementation((selector) =>
      queryResult(
        selector?.originId
          ? []
          : [
              {
                _id: transaction._id,
                journal: JOURNALS.FXA_INCOME,
                status: TR_STATUSES.COMPLETE,
                details: [{ fixedAssetId: 'asset-a', count: 3 }],
              },
            ],
      ),
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
        annualDepreciationRate: 10,
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
    expect(models.Transactions.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_DEP_IN,
        originType: TR_FOLLOW_TYPES.FXA_DEP_IN,
        side: TR_SIDES.CREDIT,
        details: [
          expect.objectContaining({
            fixedAssetId: 'asset-a',
            accountId: 'acc-dep-account',
            amount: 60,
          }),
        ],
      }),
      'user-a',
    );
  });

  it('creates opening depreciation from detail follow info when root income details are absent', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction({
      followInfos: {},
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
            preDeprecation: 20,
          },
        },
      ],
    });

    models.FixedAssets.find.mockReturnValueOnce(queryResult([]));
    models.Transactions.find.mockImplementation((selector) =>
      queryResult(selector?.originId ? [] : [transaction]),
    );

    await syncFxaIncomeDetails(models as never, 'user-a', transaction as never);

    expect(
      models.AdjustFxaDetails.replaceAdjustFxaDetails,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        adjustId: 'fxa-opening:tr-income',
        details: [
          expect.objectContaining({
            openingAccumulatedDepreciation: 60,
            closingAccumulatedDepreciation: 60,
          }),
        ],
      }),
    );
    expect(models.Transactions.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_DEP_IN,
        originType: TR_FOLLOW_TYPES.FXA_DEP_IN,
        details: [
          expect.objectContaining({
            accountId: 'acc-dep-account',
            amount: 60,
          }),
        ],
      }),
      'user-a',
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

  it('ignores self-generated income follow transactions when removing income assets', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction();

    models.FixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'asset-a',
          transactionId: 'tr-income',
          transactionDetailId: 'detail-income',
        },
      ]),
    );
    models.Transactions.findOne.mockReturnValue(queryResult(null));

    await removeFxaIncomeDetails(models as never, transaction as never);

    expect(models.Transactions.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: { $ne: 'tr-income' },
        'details.fixedAssetId': { $in: ['asset-a'] },
        $nor: [{ originId: 'tr-income' }],
      }),
    );
    expect(models.FixedAssets.deleteMany).toHaveBeenCalledWith({
      _id: { $in: ['asset-a'] },
    });
  });

  it('rejects removing income assets when another transaction uses them', async () => {
    const models = makeModels();
    const transaction = makeIncomeTransaction();

    models.FixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'asset-a',
          transactionId: 'tr-income',
          transactionDetailId: 'detail-income',
        },
      ]),
    );
    models.Transactions.findOne.mockReturnValue(
      queryResult({ _id: 'other-tr' }),
    );

    await expect(
      removeFxaIncomeDetails(models as never, transaction as never),
    ).rejects.toThrow(
      'Cannot remove transaction detail because fixed assets are already used in other transactions',
    );
  });
});

describe('fixed asset owner records', () => {
  it('assigns unique generated sequences when owner rows omit sequence', async () => {
    const models = makeModels();
    models.FxaOwnerRecords.find.mockReturnValue(
      queryResult([
        {
          fixedAssetId: 'asset-a',
          sequence: -1,
        },
      ]),
    );

    const records = await assignMissingFxaOwnerRecordSequences(
      models as never,
      [
        {
          fixedAssetId: 'asset-a',
          sequence: undefined,
        },
        {
          fixedAssetId: 'asset-a',
        },
        {
          fixedAssetId: 'asset-b',
        },
      ],
    );

    expect(records).toEqual([
      {
        fixedAssetId: 'asset-a',
        sequence: -2,
      },
      {
        fixedAssetId: 'asset-a',
        sequence: -3,
      },
      {
        fixedAssetId: 'asset-b',
        sequence: -1,
      },
    ]);
  });

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
        originId: 'move-a',
        originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
        side: TR_SIDES.DEBIT,
        branchId: undefined,
        departmentId: 'dept-call-center',
        details: [
          expect.objectContaining({
            originId: 'detail-move',
            originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
            branchId: undefined,
            departmentId: 'dept-call-center',
            amount: 100,
          }),
        ],
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

  it('creates accumulated depreciation transfer follows for internal moves', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'move-a',
      ptrId: 'ptr-move',
      parentId: 'move-a',
      number: 'FXA-MOVE-1',
      journal: JOURNALS.FXA_MOVE,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-01-03T00:00:00.000Z'),
      branchId: 'source-branch',
      departmentId: 'source-dept',
      followInfos: {
        moveInBranchId: 'dest-branch',
        moveInDepartmentId: 'dest-dept',
        accumulatedDepreciationAccountId: 'acc-dep-account',
      },
      details: [
        {
          _id: 'detail-move',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          count: 1,
          unitPrice: 350000,
          amount: 350000,
        },
      ],
    };

    models.Transactions.find.mockReturnValue(queryResult([]));
    models.FixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'asset-a',
          originalCost: 350000,
          count: 1,
          currentCount: 0,
        },
      ]),
    );
    models.AdjustFixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'adjust-a',
          date: new Date('2026-01-02T00:00:00.000Z'),
          status: ADJ_FXA_STATUSES.PUBLISH,
        },
      ]),
    );
    models.AdjustFxaDetails.find.mockReturnValue(
      queryResult([
        {
          adjustId: 'adjust-a',
          fixedAssetId: 'asset-a',
          closingAccumulatedDepreciation: 245000,
          closingBookValue: 105000,
        },
      ]),
    );

    const followTrs = await createFxaMoveDepreciationFollowTrs(
      models as never,
      'user-a',
      transaction as never,
    );

    expect(followTrs).toHaveLength(2);
    const createDocs = models.Transactions.createTransaction.mock.calls.map(
      ([doc]) => doc,
    );
    const depOutDoc = createDocs.find(
      (doc) => doc.originType === TR_FOLLOW_TYPES.FXA_DEP_OUT,
    );
    const depInDoc = createDocs.find(
      (doc) => doc.originType === TR_FOLLOW_TYPES.FXA_DEP_IN,
    );

    expect(depOutDoc).toEqual(
      expect.objectContaining({
        journal: JOURNALS.FXA_DEP_OUT,
        originId: 'move-a',
        originType: TR_FOLLOW_TYPES.FXA_DEP_OUT,
        ptrId: 'ptr-move',
        side: TR_SIDES.DEBIT,
        branchId: 'source-branch',
        departmentId: 'source-dept',
      }),
    );
    expect(depOutDoc).not.toHaveProperty('followInfos');
    expect(depOutDoc).not.toHaveProperty('extraData');
    expect(depOutDoc).not.toHaveProperty('contentType');
    expect(depOutDoc).not.toHaveProperty('contentId');
    expect(depOutDoc?.details[0]).toEqual(
      expect.objectContaining({
        fixedAssetId: 'asset-a',
        accountId: 'acc-dep-account',
        originType: TR_FOLLOW_TYPES.FXA_DEP_OUT,
        branchId: 'source-branch',
        departmentId: 'source-dept',
        amount: 245000,
      }),
    );
    expect(depOutDoc?.details[0]).not.toHaveProperty('followInfos');

    expect(depInDoc).toEqual(
      expect.objectContaining({
        journal: JOURNALS.FXA_DEP_IN,
        originId: 'move-a',
        originType: TR_FOLLOW_TYPES.FXA_DEP_IN,
        ptrId: 'ptr-move',
        side: TR_SIDES.CREDIT,
        branchId: 'dest-branch',
        departmentId: 'dest-dept',
      }),
    );
    expect(depInDoc).not.toHaveProperty('followInfos');
    expect(depInDoc).not.toHaveProperty('extraData');
    expect(depInDoc).not.toHaveProperty('contentType');
    expect(depInDoc).not.toHaveProperty('contentId');
    expect(depInDoc?.details[0]).toEqual(
      expect.objectContaining({
        fixedAssetId: 'asset-a',
        accountId: 'acc-dep-account',
        originType: TR_FOLLOW_TYPES.FXA_DEP_IN,
        branchId: 'dest-branch',
        departmentId: 'dest-dept',
        amount: 245000,
      }),
    );
    expect(depInDoc?.details[0]).not.toHaveProperty('followInfos');

    const moveInTransaction = {
      ...transaction,
      followInfos: {
        ...transaction.followInfos,
        fxaOwnerRecords: ['legacy-owner-data'],
      },
    };

    await createFxaMoveInFollowTr(
      models as never,
      'user-a',
      moveInTransaction as never,
    );

    const moveInCalls = models.Transactions.createTransaction.mock.calls;
    const moveInDoc = moveInCalls[moveInCalls.length - 1]?.[0];

    expect(moveInDoc).toEqual(
      expect.objectContaining({
        journal: JOURNALS.FXA_MOVE_IN,
        originId: 'move-a',
        originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
        side: TR_SIDES.DEBIT,
        branchId: 'dest-branch',
        departmentId: 'dest-dept',
      }),
    );
    expect(moveInDoc).not.toHaveProperty('followInfos');
    expect(moveInDoc).not.toHaveProperty('extraData');
    expect(moveInDoc?.details[0]).toEqual(
      expect.objectContaining({
        originId: 'detail-move',
        originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
        branchId: 'dest-branch',
        departmentId: 'dest-dept',
        amount: 350000,
      }),
    );
  });

  it('uses migration supplied accumulated depreciation summaries for internal moves', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'move-a',
      ptrId: 'ptr-move',
      parentId: 'move-a',
      number: 'FXA-MOVE-1',
      journal: JOURNALS.FXA_MOVE,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-01-03T00:00:00.000Z'),
      branchId: 'source-branch',
      departmentId: 'source-dept',
      followInfos: {
        moveInBranchId: 'dest-branch',
        moveInDepartmentId: 'dest-dept',
        accumulatedDepreciationAccountId: 'acc-dep-account',
        fxaDisposalSummaries: [
          {
            transactionDetailId: 'detail-move',
            accumulatedDepreciation: 245000,
          },
        ],
      },
      details: [
        {
          _id: 'detail-move',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          count: 1,
          unitPrice: 350000,
          amount: 350000,
        },
      ],
    };

    models.Transactions.find.mockReturnValue(queryResult([]));
    models.FixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'asset-a',
          originalCost: 350000,
          count: 1,
          currentCount: 0,
        },
      ]),
    );
    models.AdjustFixedAssets.find.mockReturnValue(queryResult([]));

    const followTrs = await createFxaMoveDepreciationFollowTrs(
      models as never,
      'user-a',
      transaction as never,
    );

    expect(followTrs).toHaveLength(2);
    const createDocs = models.Transactions.createTransaction.mock.calls.map(
      ([doc]) => doc,
    );

    expect(createDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          journal: JOURNALS.FXA_DEP_OUT,
          originId: 'move-a',
          side: TR_SIDES.DEBIT,
          branchId: 'source-branch',
          details: [
            expect.objectContaining({
              amount: 245000,
              branchId: 'source-branch',
            }),
          ],
        }),
        expect.objectContaining({
          journal: JOURNALS.FXA_DEP_IN,
          originId: 'move-a',
          side: TR_SIDES.CREDIT,
          branchId: 'dest-branch',
          details: [
            expect.objectContaining({
              amount: 245000,
              branchId: 'dest-branch',
            }),
          ],
        }),
      ]),
    );
  });

  it('cleans legacy migration metadata from updated move depreciation follows', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'move-a',
      ptrId: 'ptr-move',
      parentId: 'move-a',
      number: 'FXA-MOVE-1',
      journal: JOURNALS.FXA_MOVE,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-01-03T00:00:00.000Z'),
      branchId: 'source-branch',
      departmentId: 'source-dept',
      followInfos: {
        moveInBranchId: 'dest-branch',
        moveInDepartmentId: 'dest-dept',
        accumulatedDepreciationAccountId: 'acc-dep-account',
      },
      details: [
        {
          _id: 'detail-move',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          count: 1,
          unitPrice: 350000,
          amount: 350000,
        },
      ],
    };

    models.Transactions.find
      .mockReturnValueOnce(
        queryResult([
          {
            _id: 'old-dep-out',
            originId: 'move-a',
            originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
            ptrId: 'old-ptr',
            followInfos: { moveInBranchId: 'wrong-branch' },
            extraData: { migrationSource: 'erkhet' },
            contentType: 'erkhet:ptr',
            contentId: 'parent-old',
            details: [
              {
                _id: 'old-detail-out',
                originId: 'detail-move',
                originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
                followInfos: { fixedAssetCode: 'OLD' },
              },
            ],
          },
        ]),
      )
      .mockReturnValueOnce(
        queryResult([
          {
            _id: 'old-dep-in',
            originId: 'move-a',
            originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
            ptrId: 'old-ptr',
            followInfos: { moveInBranchId: 'wrong-branch' },
            extraData: { migrationSource: 'erkhet' },
            contentType: 'erkhet:ptr',
            contentId: 'parent-old',
            details: [
              {
                _id: 'old-detail-in',
                originId: 'detail-move',
                originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
                followInfos: { fixedAssetCode: 'OLD' },
              },
            ],
          },
        ]),
      );
    models.FixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'asset-a',
          originalCost: 350000,
          count: 1,
          currentCount: 0,
        },
      ]),
    );
    models.AdjustFixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'adjust-a',
          date: new Date('2026-01-02T00:00:00.000Z'),
          status: ADJ_FXA_STATUSES.PUBLISH,
        },
      ]),
    );
    models.AdjustFxaDetails.find.mockReturnValue(
      queryResult([
        {
          adjustId: 'adjust-a',
          fixedAssetId: 'asset-a',
          closingAccumulatedDepreciation: 245000,
          closingBookValue: 105000,
        },
      ]),
    );

    await createFxaMoveDepreciationFollowTrs(
      models as never,
      'user-a',
      transaction as never,
    );

    const updateDocs = models.Transactions.updateTransaction.mock.calls.map(
      ([, doc]) => doc,
    );
    const depOutDoc = updateDocs.find(
      (doc) => doc.originType === TR_FOLLOW_TYPES.FXA_DEP_OUT,
    );
    const depInDoc = updateDocs.find(
      (doc) => doc.originType === TR_FOLLOW_TYPES.FXA_DEP_IN,
    );

    expect(depOutDoc).toEqual(
      expect.objectContaining({
        originId: 'move-a',
        originType: TR_FOLLOW_TYPES.FXA_DEP_OUT,
      }),
    );
    expect(depOutDoc).toHaveProperty('followInfos', undefined);
    expect(depOutDoc).toHaveProperty('extraData', undefined);
    expect(depOutDoc).toHaveProperty('contentType', undefined);
    expect(depOutDoc).toHaveProperty('contentId', undefined);
    expect(depOutDoc?.details[0]).toEqual(
      expect.objectContaining({
        originType: TR_FOLLOW_TYPES.FXA_DEP_OUT,
      }),
    );
    expect(depOutDoc?.details[0]).toHaveProperty('followInfos', undefined);

    expect(depInDoc).toEqual(
      expect.objectContaining({
        originId: 'move-a',
        originType: TR_FOLLOW_TYPES.FXA_DEP_IN,
      }),
    );
    expect(depInDoc).toHaveProperty('followInfos', undefined);
    expect(depInDoc).toHaveProperty('extraData', undefined);
    expect(depInDoc).toHaveProperty('contentType', undefined);
    expect(depInDoc).toHaveProperty('contentId', undefined);
    expect(depInDoc?.details[0]).toEqual(
      expect.objectContaining({
        originType: TR_FOLLOW_TYPES.FXA_DEP_IN,
      }),
    );
    expect(depInDoc?.details[0]).toHaveProperty('followInfos', undefined);
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
      annualDepreciationRate: 12,
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
    const totalDepreciation = replaceCall.details.reduce(
      (sum, detail) => sum + detail.depreciationAmount,
      0,
    );

    expect(totalDepreciation).toBeCloseTo((1200 * 0.12 * 16) / 12 / 31, 6);
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
      annualDepreciationRate: 12,
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

  it('uses the latest published adjustment on or before disposal date', async () => {
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
    models.AdjustFixedAssets.find.mockReturnValue(
      queryResult([
        {
          _id: 'adjust-before',
          date: new Date('2026-01-31T00:00:00.000Z'),
          status: ADJ_FXA_STATUSES.PUBLISH,
        },
      ]),
    );
    models.AdjustFxaDetails.find.mockReturnValue(
      queryResult([
        {
          adjustId: 'adjust-future',
          fixedAssetId: 'asset-a',
          closingAccumulatedDepreciation: 800,
          closingBookValue: 1200,
        },
        {
          adjustId: 'adjust-before',
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
        date: new Date('2026-02-01T00:00:00.000Z'),
        details: [{ _id: 'detail-sale', fixedAssetId: 'asset-a', count: 2 }],
      } as never,
    );

    expect(models.AdjustFixedAssets.find).toHaveBeenCalledWith({
      status: {
        $in: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH],
      },
      date: { $lte: new Date('2026-02-01T00:00:00.000Z') },
    });
    expect(summaries[0].accumulatedDepreciation).toBe(100);
  });

  it('creates sale follow transactions for sale out, accumulated depreciation out, and sale cost', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'sale-a',
      ptrId: 'ptr-sale-revenue',
      journal: JOURNALS.FXA_SALE,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-02-01T00:00:00.000Z'),
      branchId: 'branch-a',
      departmentId: 'dept-a',
      followInfos: {
        saleOutAccountId: 'asset-account',
        accumulatedDepreciationAccountId: 'acc-dep-account',
        saleCostAccountId: 'loss-account',
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
    expect(new Set(followTrs.map((followTr) => followTr.ptrId)).size).toBe(1);
    expect(followTrs[0].ptrId).not.toBe('ptr-sale-revenue');
    expect(models.Transactions.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_SALE_OUT,
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
        journal: JOURNALS.FXA_DEP_OUT,
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
        journal: JOURNALS.FXA_SALE_COST,
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

  it('creates only accumulated depreciation out follow transaction for fixed asset out', async () => {
    const models = makeModels();
    const transaction = {
      _id: 'out-a',
      ptrId: 'ptr-out-a',
      parentId: 'parent-out-a',
      journal: JOURNALS.FXA_OUT,
      status: TR_STATUSES.COMPLETE,
      date: new Date('2026-02-01T00:00:00.000Z'),
      branchId: 'branch-a',
      departmentId: 'dept-a',
      followInfos: {
        accumulatedDepreciationAccountId: 'acc-dep-account',
      },
      details: [
        {
          _id: 'detail-out',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          count: 1,
        },
      ],
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

    expect(followTrs).toHaveLength(1);
    expect(models.Transactions.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_DEP_OUT,
        ptrId: 'ptr-out-a',
        parentId: 'parent-out-a',
        details: [
          expect.objectContaining({
            accountId: 'acc-dep-account',
            amount: 50,
          }),
        ],
      }),
      'user-a',
    );
    expect(models.Transactions.createTransaction).not.toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_SALE_OUT,
      }),
      'user-a',
    );
    expect(models.Transactions.createTransaction).not.toHaveBeenCalledWith(
      expect.objectContaining({
        journal: JOURNALS.FXA_SALE_COST,
      }),
      'user-a',
    );
  });
});
