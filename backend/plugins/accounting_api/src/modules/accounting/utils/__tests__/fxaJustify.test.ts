import type { IModels } from '~/connectionResolvers';
import type {
  ITransaction,
  ITransactionDocument,
} from '../../@types/transaction';
import { JOURNALS, TR_SIDES } from '../../@types/constants';
import {
  readFxaCorrectionRules,
  saveFxaJustify,
  validateFxaJustifyRemove,
  validateFxaJustifySave,
} from '../fxaJustify';
import { createOrUpdateTr } from '../utils';

jest.mock('../utils', () => ({ createOrUpdateTr: jest.fn() }));

const query = <T>(value: T) => ({
  sort() {
    return this;
  },
  lean: async () => value,
});

const fixture = ({
  closed = false,
  duplicate = false,
  acquired = '2026-01-01',
} = {}) => {
  const models = {
    AdjustFixedAssets: {
      findOne: jest.fn(() => query(closed ? { _id: 'calculation' } : null)),
    },
    FixedAssets: {
      find: jest.fn(() =>
        query([
          {
            _id: 'asset',
            code: 'asset',
            name: 'Asset',
            categoryId: 'category',
          },
        ]),
      ),
      findOne: jest.fn(() =>
        query({
          _id: 'asset',
          accountId: 'asset-account',
          originalCost: 100,
          count: 1,
          acquisitionDate: new Date(acquired),
          depreciationMethod: 'straightLine',
          annualDepreciationRate: 12,
        }),
      ),
    },
    Configs: {
      getConfigs: jest.fn(async () => [
        {
          subId: 'asset-account',
          value: { depreciationAccountId: 'dep-account' },
        },
      ]),
    },
    Transactions: {
      findOne: jest.fn(() =>
        query(duplicate ? { _id: 'other-correction' } : null),
      ),
      find: jest.fn(
        (selector: { journal?: { $in: string[] }; date?: { $lt: Date } }) =>
          query(
            selector.journal?.$in.includes(JOURNALS.FXA_INCOME) &&
              new Date(acquired) < (selector.date?.$lt || new Date())
              ? [
                  {
                    _id: 'income',
                    date: new Date(acquired),
                    journal: JOURNALS.FXA_INCOME,
                    details: [
                      {
                        accountId: 'asset-account',
                        fixedAssetId: 'asset',
                        count: 1,
                        amount: 100,
                        followInfos: {
                          depreciationMethod: 'straightLine',
                          annualDepreciationRate: 12,
                        },
                      },
                    ],
                  },
                ]
              : [],
          ),
      ),
    },
  };
  const doc: ITransaction = {
    date: new Date('2026-02-01'),
    journal: JOURNALS.FXA_JUSTIFY,
    side: TR_SIDES.CREDIT,
    details: [
      {
        accountId: 'dep-account',
        fixedAssetId: 'asset',
        amount: 0,
        count: 50,
        followInfos: { annualDepreciationRate: 24, salvageValue: 0 },
      },
    ],
  };
  return { models: models as unknown as IModels, rawModels: models, doc };
};

beforeEach(() => jest.clearAllMocks());

test.each([
  { annualDepreciationRate: 0 },
  { annualDepreciationRate: Infinity },
  { annualDepreciationRate: 101 },
  { salvageValue: -1 },
  { depreciationMethod: 'manual' },
  { depreciationMethod: 'unknown' },
  { depreciationStartDate: 'invalid' },
])('rejects invalid correction inputs %p', (rules) => {
  expect(() => readFxaCorrectionRules(rules)).toThrow();
});

test('a rule-only save preserves the master and snapshots prior effective rules', async () => {
  const { models, rawModels, doc } = fixture();
  jest
    .mocked(createOrUpdateTr)
    .mockImplementation(
      async (_models, _user, saved) => saved as ITransactionDocument,
    );
  const { mainTr } = await saveFxaJustify('tenant', models, 'user', doc);
  expect(mainTr.details[0]).toMatchObject({
    count: 0,
    amount: 0,
    unitPrice: 0,
    followInfos: {
      annualDepreciationRate: 24,
      salvageValue: 0,
      previousDepreciationRules: {
        depreciationMethod: 'straightLine',
        annualDepreciationRate: 12,
      },
    },
  });
  expect(rawModels.FixedAssets.find).toHaveBeenCalled();
  expect(createOrUpdateTr).toHaveBeenCalledTimes(1);
});

test('later calculated periods block saves and removals before any write', async () => {
  const { models, doc } = fixture({ closed: true });
  await expect(
    validateFxaJustifySave('tenant', models, 'user', doc),
  ).rejects.toThrow('Clear later');
  await expect(
    validateFxaJustifyRemove(models, 'tenant', doc as ITransactionDocument),
  ).rejects.toThrow('Clear later');
  expect(createOrUpdateTr).not.toHaveBeenCalled();
});

test('moving an existing correction also checks its original date', async () => {
  const { models, rawModels, doc } = fixture();
  const oldTr = {
    ...doc,
    _id: 'old',
    date: new Date('2026-01-01'),
  } as ITransactionDocument;
  await validateFxaJustifySave('tenant', models, 'user', doc, oldTr);
  expect(rawModels.AdjustFixedAssets.findOne).toHaveBeenCalledTimes(2);
});

test('cannot reduce accumulated depreciation below the posted balance', async () => {
  const { models, doc } = fixture();
  doc.side = TR_SIDES.DEBIT;
  doc.details[0].amount = 1;
  await expect(
    validateFxaJustifySave('tenant', models, 'user', doc),
  ).rejects.toThrow('exceeds posted');
});

test('rejects a wrong account, future acquisition, duplicate or empty correction', async () => {
  const { models, doc } = fixture();
  doc.details[0].accountId = 'wrong';
  await expect(
    validateFxaJustifySave('tenant', models, 'user', doc),
  ).rejects.toThrow('configured accumulated');
  const future = fixture({ acquired: '2026-03-01' });
  await expect(
    validateFxaJustifySave('tenant', future.models, 'user', future.doc),
  ).rejects.toThrow('acquired');
  const duplicate = fixture({ duplicate: true });
  await expect(
    validateFxaJustifySave('tenant', duplicate.models, 'user', duplicate.doc),
  ).rejects.toThrow('already exists');
  const empty = fixture();
  empty.doc.details[0].followInfos = {};
  await expect(
    validateFxaJustifySave('tenant', empty.models, 'user', empty.doc),
  ).rejects.toThrow('Enter a depreciation');
});
