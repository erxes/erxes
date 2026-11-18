import { Mongoose, Schema } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '../../../@types/transaction';
import { getRelAccountOverride, setPtrStatus } from '../utils';

const mongoose = new Mongoose();
const Transaction = mongoose.model<ITransactionDocument>(
  'RelatedAccountsTest',
  new Schema({
    _id: String,
    ptrId: String,
    side: String,
    originId: String,
    details: [{ accountId: String, amount: Number }],
    sumDt: Number,
    sumCt: Number,
    relAccounts: Schema.Types.Mixed,
  }),
);
const setup = () => {
  const rows = [
    new Transaction({
      _id: 'debit',
      ptrId: 'p',
      side: 'dt',
      sumDt: 100,
      sumCt: 0,
      details: [{ accountId: 'a', amount: 100 }],
    }),
    new Transaction({
      _id: 'credit',
      ptrId: 'p',
      side: 'ct',
      sumDt: 0,
      sumCt: 100,
      details: [{ accountId: 'b', amount: 100 }],
    }),
  ];
  const bulkWrite = jest.fn().mockResolvedValue({});
  const models = {
    Accounts: {
      find: jest.fn(() => ({
        lean: async () => [
          { _id: 'a', code: '101', isOutBalance: false },
          { _id: 'b', code: '201', isOutBalance: false },
          { _id: 'c', code: '301', isOutBalance: false },
        ],
      })),
    },
    Transactions: {
      find: jest.fn(() => ({ lean: async () => rows })),
      bulkWrite,
    },
  } as unknown as IModels;
  return { models, rows, bulkWrite };
};

test('blank custom sides are materialized from the computed pointer relationships', async () => {
  const { models, rows, bulkWrite } = setup();
  rows[0].relAccounts = { customCt: [' ', ''] };
  expect(await setPtrStatus(models, rows)).toBe('ok');
  expect(bulkWrite).toHaveBeenCalledWith([
    {
      updateOne: {
        filter: { _id: 'debit' },
        update: {
          $set: {
            'relAccounts.dt': [],
            'relAccounts.ct': ['201'],
            'relAccounts.customDt': [],
            'relAccounts.customCt': ['201'],
            ptrStatus: 'ok',
          },
        },
      },
    },
    {
      updateOne: {
        filter: { _id: 'credit' },
        update: {
          $set: {
            'relAccounts.dt': ['101'],
            'relAccounts.ct': [],
            'relAccounts.customDt': ['101'],
            'relAccounts.customCt': [],
            ptrStatus: 'ok',
          },
        },
      },
    },
  ]);
});

test('inherited copies follow changed counterpart accounts while differing custom sides survive', async () => {
  const { models, rows, bulkWrite } = setup();
  rows[0].relAccounts = {
    dt: [],
    ct: ['201'],
    customDt: [' 999 ', '999'],
    customCt: ['201'],
  };
  rows[1].details[0].accountId = 'c';
  await setPtrStatus(models, rows);
  expect(bulkWrite.mock.calls[0][0][0].updateOne.update.$set).toMatchObject({
    'relAccounts.ct': ['301'],
    'relAccounts.customCt': ['301'],
    'relAccounts.customDt': ['999'],
  });
});

test('same codes in a different order still inherit; explicit overrides are normalized independently', () => {
  expect(
    getRelAccountOverride([' 201 ', '101', '101'], ['101', '201']),
  ).toBeUndefined();
  expect(getRelAccountOverride([], ['101'])).toBeUndefined();
  expect(getRelAccountOverride([' 999 ', '999'], ['101'])).toEqual(['999']);
});

test('relinking a transaction never pulls counterpart codes from another pointer', async () => {
  const { models, rows, bulkWrite } = setup();
  rows[0].relAccounts = { ct: ['201'], customCt: ['201'] };
  rows[1].ptrId = 'other';
  await setPtrStatus(models, rows);
  expect(bulkWrite.mock.calls[0][0][0].updateOne.update.$set).toMatchObject({
    'relAccounts.ct': [],
    'relAccounts.customCt': [],
  });
});
