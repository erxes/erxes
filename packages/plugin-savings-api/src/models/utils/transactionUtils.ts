import { IModels } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { TRANSACTION_TYPE } from '../definitions/constants';
import {
  ITransaction,
  ITransactionDocument
} from '../definitions/transactions';

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
  if (doc.trInfo?.dealtType === 'internal') {
    const contract = await models.Contracts.findOne({
      number: doc.trInfo?.accountNumber
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
