import type { IModels } from '~/connectionResolvers';
import {
  assertNoUnsettledTransaction,
  UNSETTLED_TR_STATUSES,
  UnsettledTransactionError,
} from '../unsettledTransactions';

const modelsFinding = (transaction: unknown) => {
  const findOne = jest.fn(() => ({
    sort: () => ({ lean: () => Promise.resolve(transaction) }),
  }));
  return {
    findOne,
    models: { Transactions: { findOne } } as unknown as IModels,
  };
};

describe('adjustments stop on unsettled transactions', () => {
  it('treats estimated, executing and requested as unsettled and skips drafts', () => {
    expect(UNSETTLED_TR_STATUSES).toEqual([
      'estimated',
      'executing',
      'requested',
    ]);
  });

  it('looks only inside the adjustment scope and passes when nothing is open', async () => {
    const { models, findOne } = modelsFinding(null);
    const scope = { 'details.accountId': { $in: ['acc'] } };

    await assertNoUnsettledTransaction(models, scope);

    expect(findOne).toHaveBeenCalledWith(
      { ...scope, status: { $in: UNSETTLED_TR_STATUSES } },
      expect.any(Object),
    );
  });

  it('stops on the earliest unsettled transaction day with a warning message', async () => {
    const { models } = modelsFinding({
      _id: 'tr-a',
      number: '20260925_001',
      status: 'requested',
      date: new Date('2026-09-25T10:30:00'),
    });

    const error = await assertNoUnsettledTransaction(models, {}).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(UnsettledTransactionError);
    expect((error as UnsettledTransactionError).message).toContain(
      '20260925_001 (requested)',
    );
    expect((error as UnsettledTransactionError).date.getDate()).toBe(25);
  });
});
