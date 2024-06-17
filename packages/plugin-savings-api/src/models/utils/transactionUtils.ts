import { IModels } from '../../connectionResolver';
import { IConfig } from '../../interfaces/config';
import { getConfig } from '../../messageBroker';
import { TRANSACTION_TYPE } from '../definitions/constants';
import {
  ITransaction,
  ITransactionDocument
} from '../definitions/transactions';

export async function checkTransactionValidation(periodLock, doc, subdomain) {
  if (periodLock && !periodLock?.excludeContracts.includes(doc.contractId)) {
    throw new Error(
      'At this moment transaction can not been created because this date closed'
    );
  }
  if (doc.transactionType === TRANSACTION_TYPE.OUTCOME && subdomain) {
    const config: IConfig = await getConfig('savingConfig', subdomain);
    if (!config.oneTimeTransactionLimit) {
      throw new Error('oneTimeTransactionLimit not configured');
    }
    if (config.oneTimeTransactionLimit < doc.total) {
      throw new Error('One Time Transaction Limit not configured');
    }
  }
}

/**
 * this method generate saving payment data
 */

export const getCloseInfo = async () => {
  let result = {};
  return result;
};

export const transactionDealt = async (
  doc: ITransaction,
  models: IModels,
  subdomain
) => {
  if (doc?.dealtType === 'internal') {
    const contract = await models.Contracts.findOne({
      number: doc?.accountNumber
    }).lean();
    if (!contract) throw new Error('Dealt contract not found');

    doc.transactionType = TRANSACTION_TYPE.INCOME;

    await models.Transactions.createTransaction(doc, subdomain);
  }
};

export const removeTrAfterSchedule = async (
  models: IModels,
  tr: ITransactionDocument
) => {
  const nextTrsCount = await models.Transactions.countDocuments({
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
