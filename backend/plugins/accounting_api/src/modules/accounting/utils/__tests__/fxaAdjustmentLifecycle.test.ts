import { loadAdjustFixedAssetClass } from '../../db/models/AdjustFixedAssets';
import { IModels } from '~/connectionResolvers';
import {
  ADJ_FXA_STATUSES,
  IAdjustFixedAssetDocument,
} from '../../@types/adjustFixedAsset';
import { JOURNALS } from '../../@types/constants';
import {
  cancelAdjustFixedAsset,
  clearAdjustFixedAsset,
  publishAdjustFixedAsset,
  createAdjustFixedAssetTransaction,
} from '../adjustFixedAssets';

jest.mock('../trPermissions', () => ({
  assertCanWriteTransactionAccounts: jest.fn(),
}));
const query = <T>(value: T) => ({
  sort() {
    return this;
  },
  lean: async () => value,
});
const fixture = (posted = true) => {
  const owned = posted
    ? [
        {
          _id: 'debit',
          parentId: 'parent',
          details: [{ fixedAssetId: 'asset' }],
        },
        {
          _id: 'credit',
          parentId: 'parent',
          details: [{ fixedAssetId: 'asset' }],
        },
      ]
    : [];
  const raw = {
    AdjustFixedAssets: {
      findOne: jest.fn(() => query<null | { _id: string }>(null)),
      updateAdjustFixedAsset: jest.fn(
        async (_id: string, doc: Record<string, unknown>) => ({ _id, ...doc }),
      ),
    },
    AdjustFxaDetails: {
      deleteMany: jest.fn(),
      find: jest.fn(() => query([])),
      updateMany: jest.fn(),
    },
    Transactions: {
      find: jest.fn(() => query(owned)),
      findOne: jest.fn((filter: Record<string, unknown>) =>
        query(
          filter.journal === JOURNALS.FXA_INCOME
            ? { date: new Date('2026-01-01') }
            : null,
        ),
      ),
      removePTransaction: jest.fn(),
      createPTransaction: jest.fn(),
    },
  };
  return { raw, models: raw as unknown as IModels };
};
const adjust = (status: string): IAdjustFixedAssetDocument =>
  ({
    _id: 'adjust',
    status,
    date: new Date('2026-01-31'),
    beginDate: new Date('2026-01-01'),
    successDate: new Date('2026-01-31'),
    checkedAt: new Date('2026-02-01'),
  } as IAdjustFixedAssetDocument);

test.each([ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH])(
  'cancel %s removes one generated parent and restores an editable draft',
  async (status) => {
    const { raw, models } = fixture();
    const result = await cancelAdjustFixedAsset(models, 'user', adjust(status));
    expect(raw.Transactions.removePTransaction).toHaveBeenCalledTimes(1);
    expect(raw.Transactions.removePTransaction).toHaveBeenCalledWith({
      parentId: 'parent',
    });
    expect(raw.AdjustFxaDetails.deleteMany).toHaveBeenCalledWith({
      adjustId: 'adjust',
    });
    expect(result).toMatchObject({
      status: ADJ_FXA_STATUSES.DRAFT,
      successDate: undefined,
      checkedAt: undefined,
    });
  },
);

test('zero-depreciation completed periods can be cancelled and calculated again', async () => {
  const { models, raw } = fixture(false);
  const result = await cancelAdjustFixedAsset(
    models,
    'user',
    adjust(ADJ_FXA_STATUSES.COMPLETE),
  );
  expect(result.status).toBe(ADJ_FXA_STATUSES.DRAFT);
  expect(raw.Transactions.removePTransaction).not.toHaveBeenCalled();
});

test.each([ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH])(
  'later %s periods block clearing before deleting anything',
  async (status) => {
    const { models, raw } = fixture();
    raw.AdjustFixedAssets.findOne.mockReturnValueOnce(query({ _id: 'later' }));
    await expect(
      clearAdjustFixedAsset(models, 'user', adjust(ADJ_FXA_STATUSES.COMPLETE)),
    ).rejects.toThrow('later fixed asset adjustment');
    expect(raw.AdjustFixedAssets.findOne).toHaveBeenCalledWith({
      _id: { $ne: 'adjust' },
      date: { $gte: new Date(new Date('2026-01-31').setHours(0, 0, 0, 0)) },
      status: { $in: expect.arrayContaining([status]) },
    });
    expect(raw.Transactions.removePTransaction).not.toHaveBeenCalled();
    expect(raw.AdjustFxaDetails.deleteMany).not.toHaveBeenCalled();
  },
);

test.each([
  JOURNALS.FXA_CAPITAL,
  JOURNALS.FXA_REVALUATION,
  JOURNALS.FXA_OUT,
  JOURNALS.FXA_MOVE,
  JOURNALS.FXA_SALE,
])(
  'November %s transactions do not prevent reopening January depreciation',
  async (journal) => {
    const { models, raw } = fixture();
    raw.Transactions.findOne.mockImplementation(
      (filter: Record<string, unknown>) =>
        query(
          filter.journal === JOURNALS.FXA_INCOME
            ? { date: new Date('2026-01-01') }
            : { date: new Date('2026-11-01'), journal },
        ),
    );
    const result = await clearAdjustFixedAsset(
      models,
      'user',
      adjust(ADJ_FXA_STATUSES.COMPLETE),
    );
    expect(result.status).toBe(ADJ_FXA_STATUSES.DRAFT);
    expect(raw.Transactions.removePTransaction).toHaveBeenCalledWith({
      parentId: 'parent',
    });
    expect(raw.Transactions.findOne).toHaveBeenCalledTimes(1);
    expect(raw.Transactions.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ journal: JOURNALS.FXA_INCOME }),
    );
    expect(raw.AdjustFixedAssets.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        date: { $gte: expect.any(Date) },
        status: { $in: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH] },
      }),
    );
  },
);

test('published calculations must use cancellation rather than bypassing publication with clear', async () => {
  const { models } = fixture();
  await expect(
    clearAdjustFixedAsset(models, 'user', adjust(ADJ_FXA_STATUSES.PUBLISH)),
  ).rejects.toThrow('cannot be cleared');
});

test('publishing ignores its own generated journals when detecting modified source transactions', async () => {
  const { models, raw } = fixture();
  await publishAdjustFixedAsset(
    models,
    'user',
    adjust(ADJ_FXA_STATUSES.COMPLETE),
  );
  expect(raw.Transactions.findOne).toHaveBeenCalledWith(
    expect.objectContaining({
      $nor: [
        { contentType: 'accounting:adjustFixedAsset', contentId: 'adjust' },
      ],
    }),
  );
  expect(raw.AdjustFixedAssets.updateAdjustFixedAsset).toHaveBeenCalledWith(
    'adjust',
    expect.objectContaining({ status: ADJ_FXA_STATUSES.PUBLISH }),
  );
});

test('posting a calculated amount creates both balanced depreciation legs with zero quantities', async () => {
  const create = jest.fn(async () => [{ parentId: 'posted-parent' }]);
  const updateLinks = jest.fn();
  const models = {
    Configs: {
      getConfigs: async () => [
        {
          subId: 'asset-account',
          value: { depreciationAccountId: 'dep-account' },
        },
      ],
    },
    AdjustFxaDetails: {
      find: () =>
        query([
          {
            fixedAssetId: 'asset',
            accountId: 'asset-account',
            branchId: 'branch',
            depreciationAmount: 15000,
          },
        ]),
      updateMany: updateLinks,
    },
    Transactions: { createPTransaction: create, find: () => query([]) },
    AdjustFixedAssets: {
      updateAdjustFixedAsset: async (
        _id: string,
        doc: Record<string, unknown>,
      ) => ({ _id, ...doc }),
    },
  } as unknown as IModels;
  const result = await createAdjustFixedAssetTransaction({
    models,
    userId: 'user',
    expenseAccountId: 'expense',
    adjust: adjust(ADJ_FXA_STATUSES.PROCESS),
  });
  expect(create).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({
        journal: JOURNALS.MAIN,
        side: 'dt',
        contentId: 'adjust',
        details: [
          expect.objectContaining({
            accountId: 'expense',
            amount: 15000,
            count: 0,
            unitPrice: 0,
          }),
        ],
      }),
      expect.objectContaining({
        journal: JOURNALS.FXA_DEP,
        side: 'ct',
        contentId: 'adjust',
        details: [
          expect.objectContaining({
            accountId: 'dep-account',
            amount: 15000,
            count: 0,
            unitPrice: 0,
          }),
        ],
      }),
    ]),
    'user',
    { preservePtrIds: true },
  );
  expect(updateLinks).toHaveBeenCalledWith(
    { adjustId: 'adjust' },
    expect.objectContaining({
      $set: expect.objectContaining({ transactionId: 'posted-parent' }),
    }),
  );
  expect(result.status).toBe(ADJ_FXA_STATUSES.COMPLETE);
  expect(result.expenseAccountId).toBe('expense');
});

test('deleting a process adjustment refuses to orphan existing generated journals', async () => {
  const deleteHeader = jest.fn();
  const deleteDetails = jest.fn();
  const models = {
    AdjustFixedAssets: {
      getAdjustFixedAsset: async () => adjust(ADJ_FXA_STATUSES.PROCESS),
      deleteOne: deleteHeader,
    },
    AdjustFxaDetails: { deleteMany: deleteDetails },
    Transactions: { findOne: () => query({ _id: 'posted' }) },
  } as unknown as IModels;
  const schema = loadAdjustFixedAssetClass(models, 'test');
  await expect(schema.statics.removeAdjustFixedAsset('adjust')).rejects.toThrow(
    'Clear the linked',
  );
  expect(deleteHeader).not.toHaveBeenCalled();
  expect(deleteDetails).not.toHaveBeenCalled();
});

test.each([false, true])(
  'new adjustments remember the previous expense account (from journal=%s)',
  async (fromJournal) => {
    const create = jest.fn(async (doc: Record<string, unknown>) => doc);
    const models = {
      AdjustFixedAssets: {
        findOne: () =>
          query(
            fromJournal
              ? null
              : {
                  expenseAccountId: 'remembered-expense',
                  taxExpenseAccountId: 'remembered-tax-expense',
                },
          ),
        create,
      },
      Transactions: {
        findOne: () =>
          query({ details: [{ accountId: 'remembered-expense' }] }),
      },
    } as unknown as IModels;
    const schema = loadAdjustFixedAssetClass(models, 'test');
    const result = await schema.statics.createAdjustFixedAsset({
      date: new Date('2026-02-28'),
      description: '',
    });
    expect(result.expenseAccountId).toBe('remembered-expense');
    expect(result.taxExpenseAccountId).toBe(
      fromJournal ? undefined : 'remembered-tax-expense',
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        expenseAccountId: 'remembered-expense',
        status: ADJ_FXA_STATUSES.DRAFT,
      }),
    );
  },
);

test('rerun preserves an expense account inferred from existing posted journals', async () => {
  const { models, raw } = fixture();
  raw.Transactions.find.mockReturnValue(
    query([
      {
        _id: 'debit',
        parentId: 'parent',
        journal: JOURNALS.FXA_DEP,
        side: 'dt',
        details: [{ fixedAssetId: 'asset', accountId: 'expense' }],
      },
    ]),
  );
  await clearAdjustFixedAsset(
    models,
    'user',
    adjust(ADJ_FXA_STATUSES.COMPLETE),
  );
  expect(raw.AdjustFixedAssets.updateAdjustFixedAsset).toHaveBeenCalledWith(
    'adjust',
    expect.objectContaining({
      expenseAccountId: 'expense',
      status: ADJ_FXA_STATUSES.DRAFT,
    }),
  );
});
