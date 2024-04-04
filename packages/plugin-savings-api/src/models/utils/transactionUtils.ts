import { IModels } from '../../connectionResolver';
import {
  ICalcTrParams,
  ITransactionDocument
} from '../definitions/transactions';

/**
 * this method generate saving payment data
 */

export const getCloseInfo = async () => {
  let result = {};
  return result;
};

export const transactionIncome = async (
  models: IModels,
  subdomain: string,
  doc: ICalcTrParams | any
) => {
  let result = {};
  return result;
};

export const transactionOutcome = async () => {
  const result = {};
  return result;
};
/**
 * when transaction done
 * then schedule must be modified by paid amount
 */
export const trAfterSchedule = async (
  models: IModels,
  tr: ITransactionDocument
) => {
  if (!tr.contractId) {
    return;
  }

  return;
};

export const removeTrAfterSchedule = async (
  models: IModels,
  tr: ITransactionDocument
) => {
  const nextTrsCount = await models.Transactions.count({
    contractId: tr.contractId,
    payDate: { $gt: tr.payDate }
  }).lean();

  if (nextTrsCount > 0) {
    throw new Error(
      'this transaction is not last transaction. Please This contracts last transaction only to change or remove'
    );
  }

  if (tr.contractReaction) {
    const { _id, ...otherData } = tr.contractReaction;
    await models.Contracts.updateOne({ _id: _id }, { $set: otherData });
  }
};
