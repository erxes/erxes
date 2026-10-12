import type { IModels } from '~/connectionResolvers';
import type { ITransactionDocument } from '../../@types/transaction';
import { JOURNALS, TR_SIDES } from '../../@types/constants';
import { commonRemove } from '../commonRemove';
import {
  assertFxaIncomeRemovalsAllowed,
  removeFxaIncomeDetails,
} from '../fxaIncome';

const query = <T>(value: T) => ({
  sort() {
    return this;
  },
  lean: async () => value,
});

const income = (id = 'income', assetId = 'asset') =>
  ({
    _id: id,
    journal: JOURNALS.FXA_INCOME,
    date: new Date(),
    side: TR_SIDES.DEBIT,
    details: [
      {
        _id: `${id}-detail`,
        fixedAssetId: assetId,
        accountId: 'account',
        amount: 100,
      },
    ],
  } as ITransactionDocument);

type BlockingSelector = {
  _id: { $ne: string };
  'details.fixedAssetId': { $in: string[] };
  $nor: { originId: string }[];
};

type RemovalRecord = Pick<
  ITransactionDocument,
  '_id' | 'journal' | 'details' | 'originId'
>;

const setup = (records: RemovalRecord[] = [], ownsMaster = false) => {
  const calls = {
    deleteMasters: jest.fn(),
    deleteOwners: jest.fn(),
    deleteTransactions: jest.fn(),
    updateTransactions: jest.fn(),
    findBlocking: jest.fn((selector: BlockingSelector) =>
      query(
        records.find(
          (record) =>
            record._id !== selector._id.$ne &&
            !selector.$nor.some(
              (excluded) => excluded.originId === record.originId,
            ) &&
            record.details.some((detail) =>
              selector['details.fixedAssetId'].$in.includes(
                detail.fixedAssetId || '',
              ),
            ),
        ) || null,
      ),
    ),
  };
  const models = {
    FixedAssets: {
      find: () =>
        query(ownsMaster ? [{ _id: 'asset', transactionId: 'income' }] : []),
      deleteMany: calls.deleteMasters,
    },
    FxaOwnerRecords: { deleteMany: calls.deleteOwners },
    Transactions: {
      findOne: calls.findBlocking,
      find: () => query([]),
      deleteMany: calls.deleteTransactions,
      updateOne: calls.updateTransactions,
    },
  };
  return { models: models as unknown as IModels, calls };
};

const expectNoWrites = (calls: ReturnType<typeof setup>['calls']) => {
  expect(calls.deleteMasters).not.toHaveBeenCalled();
  expect(calls.deleteOwners).not.toHaveBeenCalled();
  expect(calls.deleteTransactions).not.toHaveBeenCalled();
  expect(calls.updateTransactions).not.toHaveBeenCalled();
};

test.each([
  JOURNALS.FXA_MOVE,
  JOURNALS.FXA_OUT,
  JOURNALS.FXA_SALE,
  JOURNALS.FXA_DEP,
])(
  'blocks income deletion when %s references its asset, even without an owned master',
  async (journal) => {
    const related = { ...income('related'), journal };
    const { models, calls } = setup([related]);
    await expect(commonRemove('tenant', models, income())).rejects.toThrow(
      'already used in other transactions',
    );
    expectNoWrites(calls);
  },
);

test('validation-only cleanup does not remove self-generated follow transactions', async () => {
  const ownFollow = {
    ...income('own-follow'),
    journal: JOURNALS.FXA_DEP_IN,
    originId: 'income',
  };
  const { models, calls } = setup([income(), ownFollow], true);
  await commonRemove('tenant', models, income(), undefined, {
    validateOnly: true,
  });
  expectNoWrites(calls);
});

test('validates only the asset references of the removed details', async () => {
  const doc = income();
  doc.details.push({
    _id: 'retained',
    fixedAssetId: 'used-asset',
    accountId: 'account',
    amount: 100,
  });
  const { models, calls } = setup([income('related', 'used-asset')]);
  await removeFxaIncomeDetails(models, doc, {
    detailIds: ['income-detail'],
    validateOnly: true,
  });
  expect(calls.findBlocking).toHaveBeenCalledWith(
    expect.objectContaining({
      'details.fixedAssetId': { $in: ['asset'] },
    }),
  );
  expectNoWrites(calls);
});

test('a blocked later income prevents any cleanup during group preflight', async () => {
  const { models, calls } = setup([income('related', 'used-asset')]);
  await expect(
    assertFxaIncomeRemovalsAllowed(models, [
      income('safe', 'unused-asset'),
      income('blocked', 'used-asset'),
    ]),
  ).rejects.toThrow('already used in other transactions');
  expect(calls.findBlocking).toHaveBeenCalledTimes(2);
  expectNoWrites(calls);
});

test('income preflight ignores non-income journals without cleanup', async () => {
  const movement = income();
  movement.journal = JOURNALS.FXA_MOVE;
  const { models, calls } = setup([income('related')]);
  await assertFxaIncomeRemovalsAllowed(models, [movement]);
  expect(calls.findBlocking).not.toHaveBeenCalled();
  expectNoWrites(calls);
});

test('unused income assets may be removed together with their own follows', async () => {
  const { models, calls } = setup(
    [{ ...income('follow'), originId: 'income' }],
    true,
  );
  await commonRemove('tenant', models, income());
  expect(calls.deleteMasters).toHaveBeenCalledWith({ _id: { $in: ['asset'] } });
  expect(calls.deleteTransactions).toHaveBeenCalledWith(
    expect.objectContaining({ originId: 'income' }),
  );
});
