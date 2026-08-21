/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES } from '../../@types/constants';
import { fixRelatedMainJournal } from '../inventories';

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
