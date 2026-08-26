/// <reference types="jest" />

import {
  JOURNALS,
  TR_FOLLOW_TYPES,
  TR_SIDES,
  TR_STATUSES,
} from '../../@types/constants';
import { ADJ_FXA_STATUSES } from '../../@types/adjustFixedAsset';
import {
  FXA_INSTANCE_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import {
  getFxaDisposalSummaries,
  getSelectedInstanceIds,
} from '../fixedAssets';
import {
  cancelAdjustFixedAsset,
  checkValidFixedAssetDate,
  clearAdjustFixedAsset,
  publishAdjustFixedAsset,
  runAdjustFixedAsset,
} from '../adjustFixedAssets';
import { removeFxaIncomeInstances, syncFxaIncomeInstances } from '../fxaIncome';
import { syncFxaMoveInstances } from '../fxaMove';
import {
  createFxaDisposalFollowTrs,
  removeFxaDisposalInstances,
  syncFxaDisposalInstances,
} from '../fxaOut';

const queryResult = <T>(value: T) => ({
  lean: jest.fn().mockResolvedValue(value),
  sort: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(value),
  }),
  select: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(value),
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(value),
    }),
  }),
});

const lean = queryResult;

const makeTransaction = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  _id: 'tr-1',
  date: new Date('2026-01-10T00:00:00.000Z'),
  branchId: 'branch-a',
  departmentId: 'dept-a',
  details: [
    {
      _id: 'detail-a',
      fixedAssetId: 'asset-a',
      count: 2,
      unitPrice: 500,
      amount: 1000,
      accountId: 'asset-account',
    },
  ],
  followInfos: {},
  extraData: {},
  ...overrides,
});

const makeModels = () => ({
  FixedAssets: {
    find: jest.fn().mockReturnValue(
      lean([
        {
          _id: 'asset-a',
          code: 'A',
          categoryId: 'cat-a',
          depreciationMethod: 'straightLine',
          usefulLife: 10,
          salvageValue: 0,
          taxDepreciationMethod: 'straightLine',
          taxUsefulLife: 10,
          taxSalvageValue: 0,
        },
      ]),
    ),
  },
  FxaInstances: {
    getCodeSequence: jest.fn((code: string, fixedAssetCode: string) => {
      const escapedCode = fixedAssetCode.replace(
        /[.*+?^${}()|[\]\\]/g,
        String.raw`\$&`,
      );
      const match = new RegExp(String.raw`^${escapedCode}_(\d+)$`).exec(code);

      return match ? Number(match[1]) : 0;
    }),
    getSequenceState: jest.fn().mockResolvedValue({
      maxSequences: new Map<string, number>(),
      usedSequences: new Map<string, Set<number>>(),
    }),
    findIncomeInstances: jest.fn(async (instanceIds: string[]) =>
      instanceIds.map((instanceId, index) => ({
        _id: instanceId,
        fixedAssetId: index === 1 ? 'asset-b' : 'asset-a',
        code: `A_00${index + 1}`,
        sequence: index + 1,
        transactionDetailId: index === 1 ? 'detail-b' : 'detail-a',
      })),
    ),
    removeByIds: jest.fn().mockResolvedValue(undefined),
    find: jest.fn().mockReturnValue(queryResult([])),
    findOne: jest.fn().mockReturnValue(
      queryResult({
        _id: 'instance-first',
        acquisitionDate: new Date(2026, 0, 1),
      }),
    ),
    findByIds: jest.fn().mockResolvedValue([]),
    findAdjustable: jest.fn().mockResolvedValue([]),
    updateOne: jest.fn().mockResolvedValue(undefined),
    upsertIncomeInstance: jest.fn(async ({ _id, doc }) => ({
      _id: _id || `instance-${doc.sequence}`,
      ...doc,
    })),
    findOrCreateMovementBucket: jest.fn(
      async ({
        sourceInstance,
        branchId,
        departmentId,
        responsibleUserId,
      }) => ({
        ...sourceInstance,
        _id: 'moved-instance-a',
        primaryInstanceId:
          sourceInstance.primaryInstanceId || sourceInstance._id,
        branchId: branchId || '',
        currentBranchId: branchId || '',
        departmentId: departmentId || '',
        currentDepartmentId: departmentId || '',
        responsibleUserId: responsibleUserId || '',
        currentResponsibleUserId: responsibleUserId || '',
      }),
    ),
  },
  FxaInstanceLogs: {
    find: jest.fn().mockReturnValue(queryResult([])),
    findByTransaction: jest.fn().mockResolvedValue([]),
    hasBlockingUsage: jest.fn().mockResolvedValue(false),
    deleteForInstances: jest.fn().mockResolvedValue(undefined),
    deleteByTransaction: jest.fn().mockResolvedValue(undefined),
    createLog: jest.fn().mockResolvedValue(undefined),
  },
  AdjustFxaDetails: {
    deleteMany: jest.fn().mockResolvedValue(undefined),
    replaceAdjustFxaDetails: jest.fn().mockResolvedValue(undefined),
    find: jest.fn().mockReturnValue(queryResult([])),
  },
  AdjustFixedAssets: {
    findOne: jest.fn().mockReturnValue(queryResult(null)),
    deleteOne: jest.fn().mockResolvedValue(undefined),
    updateOne: jest.fn().mockResolvedValue(undefined),
    updateAdjustFixedAsset: jest.fn().mockResolvedValue(undefined),
  },
  Transactions: {
    find: jest.fn().mockReturnValue(queryResult([])),
    findOne: jest.fn().mockReturnValue(queryResult(null)),
    updateOne: jest.fn().mockResolvedValue(undefined),
    createTransaction: jest.fn(async (doc) => ({
      _id: `follow-${doc.originType || doc.journal}`,
      ...doc,
    })),
    updateTransaction: jest.fn(),
  },
});

type TModels = ReturnType<typeof makeModels>;

const asParam = <T>(value: unknown): T => value as T;

const setupAdjustRun = (
  models: TModels,
  options: {
    accountId?: string;
    fixedAsset?: Record<string, unknown>;
    instance?: Record<string, unknown>;
    logs?: Record<string, unknown>[];
  } = {},
) => {
  models.FixedAssets.find.mockReturnValue(
    queryResult([
      {
        _id: 'asset-a',
        code: 'A',
        categoryId: 'cat-a',
        depreciationMethod: 'straightLine',
        usefulLife: 1,
        salvageValue: 0,
        ...options.fixedAsset,
      },
    ]),
  );
  models.FxaInstances.find.mockReturnValue(
    queryResult([
      {
        _id: 'instance-a',
        fixedAssetId: 'asset-a',
        categoryId: 'cat-a',
        originalCost: 300,
        usefulLife: 1,
        acquisitionDate: new Date(2026, 0, 1),
        depreciationStartDate: new Date(2026, 0, 1),
        branchId: 'branch-a',
        departmentId: 'dept-a',
        transactionDetailId: 'income-detail-a',
        ...options.instance,
      },
    ]),
  );
  models.FxaInstanceLogs.find.mockReturnValue(queryResult(options.logs || []));
  models.Transactions.find.mockReturnValue(
    queryResult([
      {
        details: [
          {
            _id: 'income-detail-a',
            accountId:
              options.accountId === undefined
                ? 'asset-account'
                : options.accountId,
          },
        ],
      },
    ]),
  );
};

const runAdjust = (models: TModels, date = new Date(2026, 0, 10)) =>
  runAdjustFixedAsset(
    models as unknown as Parameters<typeof runAdjustFixedAsset>[0],
    'user-1',
    asParam<Parameters<typeof runAdjustFixedAsset>[2]>({
      _id: 'adjust-1',
      date,
    }),
  );

describe('fixed asset income instances', () => {
  it('creates instances and keeps transaction provenance in acquisition logs', async () => {
    const models = makeModels();
    const transaction = makeTransaction({
      details: [
        {
          _id: 'detail-a',
          fixedAssetId: 'asset-a',
          count: 3,
          unitPrice: 500,
          amount: 1500,
          accountId: 'asset-account',
        },
      ],
    });

    await syncFxaIncomeInstances(
      models as unknown as Parameters<typeof syncFxaIncomeInstances>[0],
      'user-1',
      asParam<Parameters<typeof syncFxaIncomeInstances>[2]>(transaction),
    );

    expect(models.FxaInstances.upsertIncomeInstance).toHaveBeenCalledTimes(1);
    expect(models.FxaInstanceLogs.createLog).toHaveBeenCalledTimes(1);

    const firstDoc =
      models.FxaInstances.upsertIncomeInstance.mock.calls[0][0].doc;
    expect(firstDoc).toEqual(
      expect.objectContaining({
        fixedAssetId: 'asset-a',
        code: 'A_001',
        sequence: 1,
        count: 3,
        status: FXA_INSTANCE_STATUSES.ACTIVE,
        originalCost: 500,
        transactionDetailId: 'detail-a',
      }),
    );
    expect(firstDoc).not.toHaveProperty('transactionId');
    expect(firstDoc).not.toHaveProperty('acquisitionTransactionId');
    expect(firstDoc).not.toHaveProperty('acquisitionTrDetailId');
    expect(firstDoc).not.toHaveProperty('disposalTransactionId');
    expect(firstDoc).not.toHaveProperty('locationId');

    expect(models.FxaInstanceLogs.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        fxaInstanceId: 'instance-1',
        eventType: FXA_LOG_EVENT_TYPES.ACQUISITION,
        transactionId: 'tr-1',
        transactionDetailId: 'detail-a',
        countDelta: 3,
        toStatus: FXA_INSTANCE_STATUSES.ACTIVE,
      }),
    );
  });

  it('stores income residual value and seeds opening accumulated depreciation', async () => {
    const models = makeModels();
    const transaction = makeTransaction({
      followInfos: {
        fxaIncomeInstances: [
          {
            tempId: 'detail-a-0',
            transactionDetailId: 'detail-a',
            fixedAssetId: 'asset-a',
            code: 'A_001',
            sequence: 1,
            salvageValue: 50,
            openingAccumulatedDepreciation: 120,
          },
        ],
      },
      extraData: {
        fxaInstances: [
          {
            tempId: 'detail-a-0',
            transactionDetailId: 'detail-a',
            fixedAssetId: 'asset-a',
            code: 'A_001',
            sequence: 1,
            originalCost: 500,
          },
        ],
      },
    });

    await syncFxaIncomeInstances(
      models as unknown as Parameters<typeof syncFxaIncomeInstances>[0],
      'user-1',
      asParam<Parameters<typeof syncFxaIncomeInstances>[2]>(transaction),
    );

    expect(models.FxaInstances.upsertIncomeInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        doc: expect.objectContaining({
          salvageValue: 50,
        }),
      }),
    );
    expect(
      models.AdjustFxaDetails.replaceAdjustFxaDetails,
    ).toHaveBeenCalledWith({
      adjustId: 'fxa-opening:tr-1',
      details: [
        expect.objectContaining({
          fxaInstanceId: 'instance-1',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          originalCost: 500,
          salvageValue: 50,
          openingBookValue: 380,
          openingAccumulatedDepreciation: 120,
          depreciationAmount: 0,
          closingAccumulatedDepreciation: 120,
          closingBookValue: 380,
          transactionId: 'tr-1',
          transactionDetailId: 'detail-a',
        }),
      ],
    });
    expect(models.AdjustFixedAssets.updateOne).toHaveBeenCalledWith(
      { _id: 'fxa-opening:tr-1' },
      expect.objectContaining({
        $set: expect.objectContaining({
          status: ADJ_FXA_STATUSES.PUBLISH,
          description:
            'Opening accumulated depreciation for fixed asset income tr-1',
        }),
      }),
      { upsert: true },
    );
  });

  it('removes income instances by acquisition log detail, not instance transaction fields', async () => {
    const models = makeModels();
    models.FxaInstanceLogs.findByTransaction.mockResolvedValue([
      {
        fxaInstanceId: 'instance-a',
        transactionDetailId: 'detail-a',
      },
      {
        fxaInstanceId: 'instance-b',
        transactionDetailId: 'detail-b',
      },
    ]);

    await removeFxaIncomeInstances(
      models as unknown as Parameters<typeof removeFxaIncomeInstances>[0],
      asParam<Parameters<typeof removeFxaIncomeInstances>[1]>(
        makeTransaction(),
      ),
      { detailIds: ['detail-a'] },
    );

    expect(models.FxaInstanceLogs.findByTransaction).toHaveBeenCalledWith(
      'tr-1',
      FXA_LOG_EVENT_TYPES.ACQUISITION,
    );
    expect(models.FxaInstances.findIncomeInstances).toHaveBeenCalledWith([
      'instance-a',
    ]);
    expect(models.FxaInstanceLogs.deleteForInstances).toHaveBeenCalledWith([
      'instance-a',
    ]);
    expect(models.FxaInstances.removeByIds).toHaveBeenCalledWith([
      'instance-a',
    ]);
  });

  it('blocks income instance removal after the instance is used elsewhere', async () => {
    const models = makeModels();
    models.FxaInstanceLogs.findByTransaction.mockResolvedValue([
      {
        fxaInstanceId: 'instance-a',
        transactionDetailId: 'detail-a',
      },
    ]);
    models.FxaInstanceLogs.hasBlockingUsage.mockResolvedValue(true);

    await expect(
      removeFxaIncomeInstances(
        models as unknown as Parameters<typeof removeFxaIncomeInstances>[0],
        asParam<Parameters<typeof removeFxaIncomeInstances>[1]>(
          makeTransaction(),
        ),
      ),
    ).rejects.toThrow('fixed asset instances are already used');

    expect(models.FxaInstances.removeByIds).not.toHaveBeenCalled();
  });
});

describe('fixed asset selected instance validation', () => {
  it('allows inactive instances that belong to the transaction being edited', async () => {
    const models = makeModels();
    models.FxaInstances.findByIds.mockResolvedValue([
      {
        _id: 'instance-b',
        fixedAssetId: 'asset-a',
        status: FXA_INSTANCE_STATUSES.DISPOSED,
        count: 2,
        currentCount: 0,
      },
    ]);
    models.FxaInstanceLogs.findByTransaction.mockResolvedValue([
      {
        fxaInstanceId: 'instance-b',
        eventType: FXA_LOG_EVENT_TYPES.DISPOSAL,
        countDelta: -2,
      },
    ]);
    const transaction = makeTransaction({
      extraData: {
        fxaInstanceSelectionsByDetailId: {
          'detail-a': [{ fxaInstanceId: 'instance-b', count: 2 }],
        },
      },
    });

    await expect(
      getSelectedInstanceIds(
        models as unknown as Parameters<typeof getSelectedInstanceIds>[0],
        asParam<Parameters<typeof getSelectedInstanceIds>[1]>(transaction),
      ),
    ).resolves.toEqual(['instance-b']);
  });

  it('rejects inactive instances that do not belong to the transaction being edited', async () => {
    const models = makeModels();
    models.FxaInstances.findByIds.mockResolvedValue([
      {
        _id: 'instance-a',
        fixedAssetId: 'asset-a',
        status: FXA_INSTANCE_STATUSES.ACTIVE,
      },
      {
        _id: 'instance-b',
        fixedAssetId: 'asset-a',
        status: FXA_INSTANCE_STATUSES.DISPOSED,
      },
    ]);
    const transaction = makeTransaction({
      extraData: {
        fxaInstanceIdsByDetailId: {
          'detail-a': ['instance-a', 'instance-b'],
        },
      },
    });

    await expect(
      getSelectedInstanceIds(
        models as unknown as Parameters<typeof getSelectedInstanceIds>[0],
        asParam<Parameters<typeof getSelectedInstanceIds>[1]>(transaction),
      ),
    ).rejects.toThrow('Selected fixed asset instances are not available');
  });

  it('rejects selected instances when asset counts do not match details', async () => {
    const models = makeModels();
    models.FxaInstances.findByIds.mockResolvedValue([
      {
        _id: 'instance-b',
        fixedAssetId: 'asset-b',
        status: FXA_INSTANCE_STATUSES.ACTIVE,
      },
    ]);
    const transaction = makeTransaction({
      extraData: {
        fxaInstanceSelectionsByDetailId: {
          'detail-a': [{ fxaInstanceId: 'instance-b', count: 2 }],
        },
      },
    });

    await expect(
      getSelectedInstanceIds(
        models as unknown as Parameters<typeof getSelectedInstanceIds>[0],
        asParam<Parameters<typeof getSelectedInstanceIds>[1]>(transaction),
      ),
    ).rejects.toThrow('Selected fixed asset instance must match detail asset');
  });
});

describe('fixed asset depreciation and sale flow', () => {
  it('rejects a new adjustment when an earlier fixed asset adjustment is incomplete', async () => {
    const models = makeModels();
    models.AdjustFixedAssets.findOne
      .mockReturnValueOnce(queryResult(null))
      .mockReturnValueOnce(
        queryResult({
          _id: 'adjust-before',
          date: new Date(2026, 0, 5),
          status: ADJ_FXA_STATUSES.PROCESS,
        }),
      );

    await expect(
      checkValidFixedAssetDate(
        models as unknown as Parameters<typeof checkValidFixedAssetDate>[0],
        asParam<Parameters<typeof checkValidFixedAssetDate>[1]>({
          _id: 'adjust-1',
          date: new Date(2026, 0, 10),
        }),
      ),
    ).rejects.toThrow('earlier fixed asset adjustment is not completed');
  });

  it('calculates first depreciation adjustment from the first acquisition date', async () => {
    const models = makeModels();
    models.FxaInstances.find.mockReturnValue(
      queryResult([
        {
          _id: 'instance-a',
          fixedAssetId: 'asset-a',
          categoryId: 'cat-a',
          originalCost: 300,
          salvageValue: 0,
          usefulLife: 1,
          acquisitionDate: new Date(2026, 0, 1),
          depreciationStartDate: new Date(2026, 0, 1),
          branchId: 'branch-a',
          departmentId: 'dept-a',
          transactionDetailId: 'income-detail-a',
        },
      ]),
    );
    models.Transactions.find.mockReturnValue(
      queryResult([
        {
          details: [
            {
              _id: 'income-detail-a',
              accountId: 'asset-account',
            },
          ],
        },
      ]),
    );
    const adjust = {
      _id: 'adjust-1',
      date: new Date(2026, 0, 10),
    };

    await runAdjustFixedAsset(
      models as unknown as Parameters<typeof runAdjustFixedAsset>[0],
      'user-1',
      asParam<Parameters<typeof runAdjustFixedAsset>[2]>(adjust),
    );

    expect(
      models.AdjustFxaDetails.replaceAdjustFxaDetails,
    ).toHaveBeenCalledWith({
      adjustId: 'adjust-1',
      details: [
        expect.objectContaining({
          fxaInstanceId: 'instance-a',
          fixedAssetId: 'asset-a',
          accountId: 'asset-account',
          originalCost: 300,
          openingAccumulatedDepreciation: 0,
          depreciationAmount: 100,
          bookDepreciationAmount: 100,
          closingAccumulatedDepreciation: 100,
          closingBookValue: 200,
          error: '',
        }),
      ],
    });
    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith(
      'adjust-1',
      expect.objectContaining({
        beginDate: new Date(2026, 0, 1),
        successDate: new Date(2026, 0, 10),
        status: ADJ_FXA_STATUSES.PROCESS,
        error: '',
        modifiedBy: 'user-1',
      }),
    );
  });

  it('stops daily depreciation validation when a fixed asset transaction is incomplete', async () => {
    const models = makeModels();
    models.FxaInstances.find.mockReturnValue(
      queryResult([
        {
          _id: 'instance-a',
          fixedAssetId: 'asset-a',
          categoryId: 'cat-a',
          originalCost: 300,
          usefulLife: 1,
          acquisitionDate: new Date(2026, 0, 1),
          depreciationStartDate: new Date(2026, 0, 1),
          transactionDetailId: 'income-detail-a',
        },
      ]),
    );
    models.Transactions.find.mockReturnValue(
      queryResult([
        {
          details: [{ _id: 'income-detail-a', accountId: 'asset-account' }],
        },
      ]),
    );
    models.Transactions.findOne.mockImplementation((selector) => {
      const beginDate = selector.date?.$gte;

      if (beginDate && beginDate.getTime() === new Date(2026, 0, 5).getTime()) {
        return queryResult({
          _id: 'fxa-tr-incomplete',
          number: 'FXA-5',
          status: TR_STATUSES.DRAFT,
        });
      }

      return queryResult(null);
    });

    await runAdjustFixedAsset(
      models as unknown as Parameters<typeof runAdjustFixedAsset>[0],
      'user-1',
      asParam<Parameters<typeof runAdjustFixedAsset>[2]>({
        _id: 'adjust-1',
        date: new Date(2026, 0, 10),
      }),
    );

    expect(
      models.AdjustFxaDetails.replaceAdjustFxaDetails,
    ).toHaveBeenCalledWith({
      adjustId: 'adjust-1',
      details: [],
    });
    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith(
      'adjust-1',
      expect.objectContaining({
        successDate: new Date(2026, 0, 4),
        status: ADJ_FXA_STATUSES.PROCESS,
        error: expect.stringContaining('FXA-5 (draft)'),
      }),
    );
  });

  it('allows business-active fixed asset transaction statuses during daily validation', async () => {
    const models = makeModels();
    models.FxaInstances.find.mockReturnValue(
      queryResult([
        {
          _id: 'instance-a',
          fixedAssetId: 'asset-a',
          categoryId: 'cat-a',
          originalCost: 300,
          usefulLife: 1,
          acquisitionDate: new Date(2026, 0, 1),
          depreciationStartDate: new Date(2026, 0, 1),
          transactionDetailId: 'income-detail-a',
        },
      ]),
    );
    models.Transactions.find.mockReturnValue(
      queryResult([
        {
          details: [{ _id: 'income-detail-a', accountId: 'asset-account' }],
        },
      ]),
    );

    await runAdjustFixedAsset(
      models as unknown as Parameters<typeof runAdjustFixedAsset>[0],
      'user-1',
      asParam<Parameters<typeof runAdjustFixedAsset>[2]>({
        _id: 'adjust-1',
        date: new Date(2026, 0, 3),
      }),
    );

    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith(
      'adjust-1',
      expect.objectContaining({
        status: ADJ_FXA_STATUSES.PROCESS,
        error: '',
      }),
    );
  });

  it.each([
    {
      name: 'missing original cost',
      options: { instance: { originalCost: 0 } },
      message: 'original cost is missing',
    },
    {
      name: 'missing useful life',
      options: {
        fixedAsset: { usefulLife: undefined },
        instance: { usefulLife: undefined },
      },
      message: 'useful life is missing',
    },
    {
      name: 'missing asset account',
      options: { accountId: '' },
      message: 'account is missing',
    },
    {
      name: 'unsupported depreciation method',
      options: { instance: { depreciationMethod: 'manual' } },
      message:
        'Manual fixed asset depreciation requires entered depreciation detail',
    },
  ])(
    'stops daily depreciation validation on $name',
    async ({ options, message }) => {
      const models = makeModels();
      setupAdjustRun(models, options);

      await runAdjust(models);

      expect(
        models.AdjustFxaDetails.replaceAdjustFxaDetails,
      ).toHaveBeenCalledWith({
        adjustId: 'adjust-1',
        details: [],
      });
      expect(
        models.AdjustFixedAssets.updateAdjustFixedAsset,
      ).toHaveBeenCalledWith(
        'adjust-1',
        expect.objectContaining({
          successDate: new Date(2025, 11, 31),
          status: ADJ_FXA_STATUSES.PROCESS,
          error: expect.stringContaining(message),
        }),
      );
    },
  );

  it.each([
    'straightLine',
    'sumOfYearsDigits',
    'doubleDecliningBalance',
    'decliningBalance',
  ])('calculates fixed asset depreciation with %s method', async (method) => {
    const models = makeModels();
    setupAdjustRun(models, {
      instance: {
        depreciationMethod: method,
        originalCost: 1200,
        usefulLife: 12,
        salvageValue: 120,
      },
      fixedAsset: {
        depreciationMethod: method,
        usefulLife: 12,
        salvageValue: 120,
      },
    });

    await runAdjust(models, new Date(2026, 0, 10));

    expect(
      models.AdjustFxaDetails.replaceAdjustFxaDetails,
    ).toHaveBeenCalledWith({
      adjustId: 'adjust-1',
      details: [
        expect.objectContaining({
          fxaInstanceId: 'instance-a',
          depreciationAmount: expect.any(Number),
          error: '',
        }),
      ],
    });

    const detail =
      models.AdjustFxaDetails.replaceAdjustFxaDetails.mock.calls.at(-1)?.[0]
        .details[0];

    expect(detail?.depreciationAmount).toBeGreaterThan(0);
    expect(detail?.closingBookValue).toBeGreaterThanOrEqual(120);
  });

  it.each([
    {
      name: 'log missing instance id',
      log: {
        eventType: FXA_LOG_EVENT_TYPES.MOVE,
        eventDate: new Date(2026, 0, 2),
        toBranchId: 'branch-b',
      },
      message: 'log is missing instance id',
      successDate: new Date(2026, 0, 1),
    },
    {
      name: 'log missing event date',
      log: {
        fxaInstanceId: 'instance-a',
        eventType: FXA_LOG_EVENT_TYPES.MOVE,
        toBranchId: 'branch-b',
      },
      message: 'log is missing event date',
      successDate: new Date(2025, 11, 31),
    },
    {
      name: 'acquisition log missing transaction detail',
      log: {
        fxaInstanceId: 'instance-a',
        eventType: FXA_LOG_EVENT_TYPES.ACQUISITION,
        eventDate: new Date(2026, 0, 2),
      },
      message: 'acquisition log is missing transaction detail',
      successDate: new Date(2026, 0, 1),
    },
    {
      name: 'move log missing destination branch',
      log: {
        fxaInstanceId: 'instance-a',
        eventType: FXA_LOG_EVENT_TYPES.MOVE,
        eventDate: new Date(2026, 0, 3),
      },
      message: 'move log is missing destination branch',
      successDate: new Date(2026, 0, 2),
    },
    {
      name: 'sale log missing target status',
      log: {
        fxaInstanceId: 'instance-a',
        eventType: FXA_LOG_EVENT_TYPES.SALE,
        eventDate: new Date(2026, 0, 4),
      },
      message: 'disposal/sale log is missing target status',
      successDate: new Date(2026, 0, 3),
    },
    {
      name: 'invalid log event type',
      log: {
        fxaInstanceId: 'instance-a',
        eventType: 'badEvent',
        eventDate: new Date(2026, 0, 5),
      },
      message: 'invalid event type',
      successDate: new Date(2026, 0, 4),
    },
  ])(
    'stops daily depreciation validation on $name',
    async ({ log, message, successDate }) => {
      const models = makeModels();
      setupAdjustRun(models, { logs: [log] });

      await runAdjust(models);

      expect(
        models.AdjustFixedAssets.updateAdjustFixedAsset,
      ).toHaveBeenCalledWith(
        'adjust-1',
        expect.objectContaining({
          successDate,
          status: ADJ_FXA_STATUSES.PROCESS,
          error: expect.stringContaining(message),
        }),
      );
    },
  );

  it('rejects adjustment date when a later fixed asset adjustment exists', async () => {
    const models = makeModels();
    models.AdjustFixedAssets.findOne.mockReturnValueOnce(
      queryResult({
        _id: 'adjust-after',
        date: new Date(2026, 0, 20),
        status: ADJ_FXA_STATUSES.PUBLISH,
      }),
    );

    await expect(
      checkValidFixedAssetDate(
        models as unknown as Parameters<typeof checkValidFixedAssetDate>[0],
        asParam<Parameters<typeof checkValidFixedAssetDate>[1]>({
          _id: 'adjust-1',
          date: new Date(2026, 0, 10),
        }),
      ),
    ).rejects.toThrow('later fixed asset adjustment already exists');
  });

  it('rejects adjustment when no acquisition exists before the adjustment date', async () => {
    const models = makeModels();
    models.FxaInstances.findOne.mockReturnValue(queryResult(null));

    await expect(
      checkValidFixedAssetDate(
        models as unknown as Parameters<typeof checkValidFixedAssetDate>[0],
        asParam<Parameters<typeof checkValidFixedAssetDate>[1]>({
          _id: 'adjust-1',
          date: new Date(2026, 0, 10),
        }),
      ),
    ).rejects.toThrow('No fixed asset acquisition found');
  });

  it('depreciates a sold instance only through the sale day in the adjusted period', async () => {
    const models = makeModels();
    models.FxaInstances.find.mockReturnValue(
      queryResult([
        {
          _id: 'instance-a',
          fixedAssetId: 'asset-a',
          categoryId: 'cat-a',
          originalCost: 300,
          usefulLife: 1,
          acquisitionDate: new Date(2026, 0, 1),
          depreciationStartDate: new Date(2026, 0, 1),
          branchId: 'branch-a',
          departmentId: 'dept-a',
          transactionDetailId: 'income-detail-a',
        },
      ]),
    );
    models.FxaInstanceLogs.find.mockReturnValue(
      queryResult([
        {
          fxaInstanceId: 'instance-a',
          fixedAssetId: 'asset-a',
          eventType: FXA_LOG_EVENT_TYPES.ACQUISITION,
          eventDate: new Date(2026, 0, 1),
          countDelta: 1,
          transactionDetailId: 'income-detail-a',
          toStatus: FXA_INSTANCE_STATUSES.ACTIVE,
        },
        {
          fxaInstanceId: 'instance-a',
          fixedAssetId: 'asset-a',
          eventType: FXA_LOG_EVENT_TYPES.SALE,
          eventDate: new Date(2026, 0, 6),
          countDelta: -1,
          toStatus: FXA_INSTANCE_STATUSES.SOLD,
        },
      ]),
    );
    models.Transactions.find.mockReturnValue(
      queryResult([
        {
          details: [{ _id: 'income-detail-a', accountId: 'asset-account' }],
        },
      ]),
    );

    await runAdjustFixedAsset(
      models as unknown as Parameters<typeof runAdjustFixedAsset>[0],
      'user-1',
      asParam<Parameters<typeof runAdjustFixedAsset>[2]>({
        _id: 'adjust-1',
        date: new Date(2026, 0, 10),
      }),
    );

    expect(
      models.AdjustFxaDetails.replaceAdjustFxaDetails,
    ).toHaveBeenCalledWith({
      adjustId: 'adjust-1',
      details: [
        expect.objectContaining({
          fxaInstanceId: 'instance-a',
          depreciationAmount: 50,
          closingAccumulatedDepreciation: 50,
          closingBookValue: 250,
        }),
      ],
    });
  });

  it('uses latest depreciation adjustment when summarizing a sale', async () => {
    const models = makeModels();
    models.FxaInstances.findByIds.mockResolvedValue([
      {
        _id: 'instance-a',
        fixedAssetId: 'asset-a',
        status: FXA_INSTANCE_STATUSES.ACTIVE,
        originalCost: 1000,
      },
    ]);
    models.AdjustFxaDetails.find.mockReturnValue(
      queryResult([
        {
          fxaInstanceId: 'instance-a',
          closingAccumulatedDepreciation: 300,
          createdAt: new Date('2026-02-01T00:00:00.000Z'),
        },
      ]),
    );
    const sale = makeTransaction({
      details: [
        {
          _id: 'sale-detail-a',
          fixedAssetId: 'asset-a',
          count: 1,
          unitPrice: 1200,
          amount: 1200,
        },
      ],
      followInfos: {
        fixedAssetAccountId: 'asset-account',
        accumulatedDepreciationAccountId: 'accum-dep-account',
        lossAccountId: 'loss-account',
      },
      extraData: {
        fxaInstanceIdsByDetailId: {
          'sale-detail-a': ['instance-a'],
        },
      },
    });

    await expect(
      getFxaDisposalSummaries(
        models as unknown as Parameters<typeof getFxaDisposalSummaries>[0],
        asParam<Parameters<typeof getFxaDisposalSummaries>[1]>(sale),
      ),
    ).resolves.toEqual([
      {
        detailId: 'sale-detail-a',
        fixedAssetId: 'asset-a',
        count: 1,
        originalCost: 1000,
        accumulatedDepreciation: 300,
        bookValue: 700,
      },
    ]);
  });

  it('publishes a completed adjustment when no fixed asset transactions changed after checking', async () => {
    const models = makeModels();
    const adjust = {
      _id: 'adjust-1',
      status: ADJ_FXA_STATUSES.COMPLETE,
      beginDate: new Date(2026, 0, 1),
      successDate: new Date(2026, 0, 10),
      checkedAt: new Date(2026, 0, 10, 12),
    };

    await publishAdjustFixedAsset(
      models as unknown as Parameters<typeof publishAdjustFixedAsset>[0],
      'user-1',
      asParam<Parameters<typeof publishAdjustFixedAsset>[2]>(adjust),
    );

    expect(models.Transactions.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        date: {
          $gte: adjust.beginDate,
          $lte: adjust.successDate,
        },
        'details.fixedAssetId': { $exists: true, $ne: '' },
      }),
    );
    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith('adjust-1', {
      status: ADJ_FXA_STATUSES.PUBLISH,
      modifiedBy: 'user-1',
    });
  });

  it('moves a completed adjustment back to process when source fixed asset transactions changed', async () => {
    const models = makeModels();
    models.Transactions.findOne.mockReturnValue(
      queryResult({
        _id: 'fxa-tr-1',
        updatedAt: new Date(2026, 0, 10, 13),
      }),
    );
    const adjust = {
      _id: 'adjust-1',
      status: ADJ_FXA_STATUSES.COMPLETE,
      beginDate: new Date(2026, 0, 1),
      successDate: new Date(2026, 0, 10),
      checkedAt: new Date(2026, 0, 10, 12),
    };

    await expect(
      publishAdjustFixedAsset(
        models as unknown as Parameters<typeof publishAdjustFixedAsset>[0],
        'user-1',
        asParam<Parameters<typeof publishAdjustFixedAsset>[2]>(adjust),
      ),
    ).rejects.toThrow('modified some transactions');

    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith('adjust-1', {
      status: ADJ_FXA_STATUSES.PROCESS,
      modifiedBy: '',
    });
  });

  it('rejects publishing before depreciation transaction is completed', async () => {
    const models = makeModels();

    await expect(
      publishAdjustFixedAsset(
        models as unknown as Parameters<typeof publishAdjustFixedAsset>[0],
        'user-1',
        asParam<Parameters<typeof publishAdjustFixedAsset>[2]>({
          _id: 'adjust-1',
          status: ADJ_FXA_STATUSES.PROCESS,
        }),
      ),
    ).rejects.toThrow('cannot be published yet');

    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).not.toHaveBeenCalled();
  });

  it('cancels a published adjustment back to draft', async () => {
    const models = makeModels();

    await cancelAdjustFixedAsset(
      models as unknown as Parameters<typeof cancelAdjustFixedAsset>[0],
      'user-1',
      asParam<Parameters<typeof cancelAdjustFixedAsset>[2]>({
        _id: 'adjust-1',
        status: ADJ_FXA_STATUSES.PUBLISH,
      }),
    );

    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith('adjust-1', {
      status: ADJ_FXA_STATUSES.DRAFT,
      modifiedBy: 'user-1',
    });
  });

  it('rejects cancelling an unpublished adjustment', async () => {
    const models = makeModels();

    await expect(
      cancelAdjustFixedAsset(
        models as unknown as Parameters<typeof cancelAdjustFixedAsset>[0],
        'user-1',
        asParam<Parameters<typeof cancelAdjustFixedAsset>[2]>({
          _id: 'adjust-1',
          status: ADJ_FXA_STATUSES.PROCESS,
        }),
      ),
    ).rejects.toThrow('cannot be cancelled');
  });

  it('clears calculated details and resets a process adjustment to draft', async () => {
    const models = makeModels();
    const adjust = {
      _id: 'adjust-1',
      date: new Date(2026, 0, 10),
      status: ADJ_FXA_STATUSES.PROCESS,
    };

    await clearAdjustFixedAsset(
      models as unknown as Parameters<typeof clearAdjustFixedAsset>[0],
      'user-1',
      asParam<Parameters<typeof clearAdjustFixedAsset>[2]>(adjust),
    );

    expect(models.AdjustFxaDetails.deleteMany).toHaveBeenCalledWith({
      adjustId: 'adjust-1',
    });
    expect(
      models.AdjustFixedAssets.updateAdjustFixedAsset,
    ).toHaveBeenCalledWith('adjust-1', {
      beginDate: new Date(2026, 0, 1),
      successDate: undefined,
      checkedAt: undefined,
      status: ADJ_FXA_STATUSES.DRAFT,
      error: '',
      warning: '',
      modifiedBy: 'user-1',
    });
  });

  it('rejects clearing a published adjustment', async () => {
    const models = makeModels();

    await expect(
      clearAdjustFixedAsset(
        models as unknown as Parameters<typeof clearAdjustFixedAsset>[0],
        'user-1',
        asParam<Parameters<typeof clearAdjustFixedAsset>[2]>({
          _id: 'adjust-1',
          date: new Date(2026, 0, 10),
          status: ADJ_FXA_STATUSES.PUBLISH,
        }),
      ),
    ).rejects.toThrow('cannot be cleared');

    expect(models.AdjustFxaDetails.deleteMany).not.toHaveBeenCalled();
  });

  it('creates sale follow transactions from original cost, accumulated depreciation, and book value', async () => {
    const models = makeModels();
    models.FxaInstances.findByIds.mockResolvedValue([
      {
        _id: 'instance-a',
        fixedAssetId: 'asset-a',
        status: FXA_INSTANCE_STATUSES.ACTIVE,
        originalCost: 1000,
      },
    ]);
    models.AdjustFxaDetails.find.mockReturnValue(
      queryResult([
        {
          fxaInstanceId: 'instance-a',
          closingAccumulatedDepreciation: 300,
          createdAt: new Date('2026-02-01T00:00:00.000Z'),
        },
      ]),
    );
    const sale = makeTransaction({
      journal: JOURNALS.FXA_SALE,
      side: TR_SIDES.DEBIT,
      status: TR_STATUSES.COMPLETE,
      details: [
        {
          _id: 'sale-detail-a',
          fixedAssetId: 'asset-a',
          count: 1,
          unitPrice: 1200,
          amount: 1200,
        },
      ],
      followInfos: {
        fixedAssetAccountId: 'asset-account',
        accumulatedDepreciationAccountId: 'accum-dep-account',
        lossAccountId: 'loss-account',
      },
      extraData: {
        fxaInstanceIdsByDetailId: {
          'sale-detail-a': ['instance-a'],
        },
      },
    });

    await createFxaDisposalFollowTrs(
      models as unknown as Parameters<typeof createFxaDisposalFollowTrs>[0],
      'user-1',
      asParam<Parameters<typeof createFxaDisposalFollowTrs>[2]>(sale),
    );

    const createdDocs = models.Transactions.createTransaction.mock.calls.map(
      ([doc]) => doc,
    );

    expect(createdDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          originType: TR_FOLLOW_TYPES.FXA_OUT_COST,
          journal: JOURNALS.FXA_OUT_COST,
          side: TR_SIDES.CREDIT,
          details: [
            expect.objectContaining({
              accountId: 'asset-account',
              amount: 1000,
              unitPrice: 1000,
            }),
          ],
        }),
        expect.objectContaining({
          originType: TR_FOLLOW_TYPES.FXA_OUT_DEPRECIATION,
          journal: JOURNALS.FXA_OUT_DEPRECIATION,
          side: TR_SIDES.DEBIT,
          details: [
            expect.objectContaining({
              accountId: 'accum-dep-account',
              amount: 300,
              unitPrice: 300,
            }),
          ],
        }),
        expect.objectContaining({
          originType: TR_FOLLOW_TYPES.FXA_OUT_LOSS,
          journal: JOURNALS.FXA_OUT_LOSS,
          side: TR_SIDES.DEBIT,
          details: [
            expect.objectContaining({
              accountId: 'loss-account',
              amount: 700,
              unitPrice: 700,
            }),
          ],
        }),
      ]),
    );
  });

  it('rebuilds sold instances when a sale transaction is removed after depreciation', async () => {
    const models = makeModels();
    models.FxaInstanceLogs.findByTransaction.mockResolvedValue([
      {
        fxaInstanceId: 'instance-a',
        eventType: FXA_LOG_EVENT_TYPES.SALE,
        fromStatus: FXA_INSTANCE_STATUSES.ACTIVE,
        toStatus: FXA_INSTANCE_STATUSES.SOLD,
      },
    ]);

    await removeFxaDisposalInstances(
      models as unknown as Parameters<typeof removeFxaDisposalInstances>[0],
      asParam<Parameters<typeof removeFxaDisposalInstances>[1]>(
        makeTransaction({
          _id: 'sale-tr-1',
          journal: JOURNALS.FXA_SALE,
        }),
      ),
    );

    expect(models.FxaInstanceLogs.deleteByTransaction).toHaveBeenCalledWith(
      'sale-tr-1',
    );
    expect(models.FxaInstances.findByIds).toHaveBeenCalledWith(['instance-a']);
  });
});

describe('fixed asset disposal and move snapshots', () => {
  const setupActiveSelection = (models: TModels) => {
    const instances = [
      {
        _id: 'instance-a',
        fixedAssetId: 'asset-a',
        status: FXA_INSTANCE_STATUSES.ACTIVE,
        count: 1,
        currentCount: 1,
        branchId: 'branch-a',
        departmentId: 'dept-a',
        responsibleUserId: 'user-a',
      },
      {
        _id: 'instance-b',
        fixedAssetId: 'asset-a',
        status: FXA_INSTANCE_STATUSES.ACTIVE,
        count: 1,
        currentCount: 1,
        branchId: 'branch-a',
        departmentId: 'dept-a',
        responsibleUserId: 'user-b',
      },
    ];

    models.FxaInstances.findByIds.mockImplementation((ids: string[]) =>
      Promise.resolve(
        instances.filter((instance) => ids.includes(instance._id)),
      ),
    );
  };

  it('writes disposal count-delta and transaction provenance to logs', async () => {
    const models = makeModels();
    setupActiveSelection(models);
    const transaction = makeTransaction({
      details: [
        {
          _id: 'detail-a',
          fixedAssetId: 'asset-a',
          count: 1,
          unitPrice: 100,
          amount: 100,
        },
      ],
      extraData: {
        fxaInstanceSelectionsByDetailId: {
          'detail-a': [{ fxaInstanceId: 'instance-a', count: 1 }],
        },
      },
    });

    await syncFxaDisposalInstances(
      models as unknown as Parameters<typeof syncFxaDisposalInstances>[0],
      'user-1',
      asParam<Parameters<typeof syncFxaDisposalInstances>[2]>(transaction),
      FXA_LOG_EVENT_TYPES.DISPOSAL,
      FXA_INSTANCE_STATUSES.DISPOSED,
    );

    expect(models.FxaInstanceLogs.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        fxaInstanceId: 'instance-a',
        eventType: FXA_LOG_EVENT_TYPES.DISPOSAL,
        countDelta: -1,
        transactionId: 'tr-1',
        fromStatus: FXA_INSTANCE_STATUSES.ACTIVE,
        toStatus: FXA_INSTANCE_STATUSES.DISPOSED,
      }),
    );
  });

  it('rebuilds disposed instances from logs when a disposal transaction is removed', async () => {
    const models = makeModels();
    models.FxaInstanceLogs.findByTransaction.mockResolvedValue([
      {
        fxaInstanceId: 'instance-a',
        fromStatus: FXA_INSTANCE_STATUSES.ACTIVE,
      },
      {
        fxaInstanceId: 'instance-b',
        fromStatus: FXA_INSTANCE_STATUSES.ACTIVE,
      },
    ]);

    await removeFxaDisposalInstances(
      models as unknown as Parameters<typeof removeFxaDisposalInstances>[0],
      asParam<Parameters<typeof removeFxaDisposalInstances>[1]>(
        makeTransaction(),
      ),
    );

    expect(models.FxaInstanceLogs.deleteByTransaction).toHaveBeenCalledWith(
      'tr-1',
    );
    expect(models.FxaInstances.findByIds).toHaveBeenCalledWith([
      'instance-a',
      'instance-b',
    ]);
  });

  it('moves quantity to a destination bucket and keeps move provenance in logs', async () => {
    const models = makeModels();
    setupActiveSelection(models);
    const transaction = makeTransaction({
      details: [
        {
          _id: 'detail-a',
          fixedAssetId: 'asset-a',
          count: 1,
          unitPrice: 100,
          amount: 100,
        },
      ],
      followInfos: {
        moveInBranchId: 'branch-b',
        moveInDepartmentId: 'dept-b',
      },
      extraData: {
        fxaInstanceSelectionsByDetailId: {
          'detail-a': [{ fxaInstanceId: 'instance-a', count: 1 }],
        },
      },
    });

    await syncFxaMoveInstances(
      models as unknown as Parameters<typeof syncFxaMoveInstances>[0],
      'user-1',
      asParam<Parameters<typeof syncFxaMoveInstances>[2]>(transaction),
    );

    expect(models.FxaInstances.findOrCreateMovementBucket).toHaveBeenCalledWith(
      {
        sourceInstance: expect.objectContaining({ _id: 'instance-a' }),
        branchId: 'branch-b',
        departmentId: 'dept-b',
        responsibleUserId: 'user-a',
        userId: 'user-1',
      },
    );
    expect(models.FxaInstanceLogs.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        fxaInstanceId: 'instance-a',
        eventType: FXA_LOG_EVENT_TYPES.MOVE,
        countDelta: -1,
        transactionId: 'tr-1',
        fromBranchId: 'branch-a',
        toBranchId: 'branch-a',
      }),
    );
    expect(models.FxaInstanceLogs.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        fxaInstanceId: 'moved-instance-a',
        eventType: FXA_LOG_EVENT_TYPES.MOVE,
        countDelta: 1,
        transactionId: 'tr-1',
        fromBranchId: 'branch-a',
        toBranchId: 'branch-b',
      }),
    );
  });
});
