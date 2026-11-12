import { IModels } from '~/connectionResolvers';
import { JOURNALS } from '../../@types/constants';
import { ITransaction } from '../../@types/transaction';
import { createOrUpdateTr } from '../utils';
import { validateFxaIncomeAcquisition } from '../fxaIncome';

test.each([JOURNALS.FXA_DEP, JOURNALS.FXA_DEP_IN, JOURNALS.FXA_DEP_OUT])(
  '%s preserves amounts without asset quantities on create and edit',
  async (journal) => {
    const createTransaction = jest.fn(async (doc: ITransaction) => ({
      ...doc,
      _id: 'saved',
    }));
    const updateTransaction = jest.fn(
      async (_id: string, doc: ITransaction) => ({ ...doc, _id }),
    );
    const models = {
      Transactions: { createTransaction, updateTransaction },
    } as unknown as IModels;
    const doc: ITransaction = {
      journal,
      date: new Date(),
      details: [
        { fixedAssetId: 'asset', count: 3, unitPrice: 5000, amount: 15000 },
      ],
    };
    const created = await createOrUpdateTr(models, 'user', doc);
    expect(created.details[0]).toMatchObject({
      count: 0,
      unitPrice: 0,
      amount: 15000,
    });
    await createOrUpdateTr(
      models,
      'user',
      { ...doc, details: [{ ...doc.details[0], count: 2 }] },
      created,
    );
    expect(updateTransaction.mock.calls[0][1].details[0]).toMatchObject({
      count: 0,
      unitPrice: 0,
      amount: 15000,
    });
  },
);

test.each([
  { preDeprecation: -1 },
  { preDeprecation: Number.NaN },
  { preDeprecation: 301 },
  { revaluationLoss: 5, revaluationReserve: 5 },
])(
  'income validates total inputs before accessing models: %p',
  async (followInfos) => {
    const doc: ITransaction = {
      journal: JOURNALS.FXA_INCOME,
      date: new Date(),
      details: [{ count: 3, unitPrice: 100, amount: 300, followInfos }],
    };
    await expect(
      validateFxaIncomeAcquisition({} as IModels, 'user', doc),
    ).rejects.toThrow();
  },
);
