import { getPureDate } from 'erxes-api-shared/utils';
import type { FilterQuery } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import { TR_STATUSES, TRANSACTION_STATUS_TYPES } from '../@types/constants';
import type { ITransactionDocument } from '../@types/transaction';

/**
 * Real or pending rows that are not yet complete. Their amounts are counted
 * or about to be, so an adjustment cannot settle a period past them. Draft,
 * addressed draft and planned rows (omit) never count and are ignored.
 */
export const UNSETTLED_TR_STATUSES = [
  ...TRANSACTION_STATUS_TYPES.REAL_STATUSES,
  ...TRANSACTION_STATUS_TYPES.SOON_STATUSES,
].filter((status) => status !== TR_STATUSES.COMPLETE);

/** Stops an adjustment as a warning on the unsettled transaction's day. */
export class UnsettledTransactionError extends Error {
  date: Date;

  constructor(
    transaction: Pick<
      ITransactionDocument,
      '_id' | 'number' | 'status' | 'date'
    >,
  ) {
    super(
      `Transactions must be complete before adjusting. Transaction: ${
        transaction.number || transaction._id
      } (${transaction.status})`,
    );
    this.date = getPureDate(transaction.date);
  }
}

/** Throws for the earliest unsettled transaction within an adjustment scope. */
export const assertNoUnsettledTransaction = async (
  models: IModels,
  scope: FilterQuery<ITransactionDocument>,
) => {
  const transaction = await models.Transactions.findOne(
    { ...scope, status: { $in: UNSETTLED_TR_STATUSES } },
    { _id: 1, number: 1, status: 1, date: 1 },
  )
    .sort({ date: 1 })
    .lean();

  if (transaction) {
    throw new UnsettledTransactionError(transaction);
  }
};
