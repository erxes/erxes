import { IUserDocument } from "@erxes/api-utils/src/types";
import { IModels } from "../connectionResolver";
import { ITransactionDocument, IHiddenTransaction } from '../models/definitions/transaction';

const convertToHidden = (transaction: ITransactionDocument) => {
  return {
    _id: transaction._id,
    parentId: transaction.parentId,
    ptrId: transaction.ptrId,
    ptrStatus: transaction.ptrStatus,
    originId: transaction.originId,
    follows: transaction.follows,
    details: transaction.details.map(detail => ({
      _id: detail._id,
      originId: detail.originId,
      follows: detail.follows,
      side: detail.side,
    })),
    sumDt: transaction.sumDt,
    sumCt: transaction.sumCt,
  } as IHiddenTransaction
}

const canShowTr = async (models: IModels, transaction: ITransactionDocument, user: IUserDocument) => {
  if (!user._id) {
    return false
  }
  return true;
}

export const canShowTrs = async (models: IModels, transactions: ITransactionDocument[], user: IUserDocument) => {
  const originTrs = transactions.filter(tr => !tr.originId);

  const result: (ITransactionDocument | IHiddenTransaction)[] = [];

  for (const otr of originTrs) {
    if (await canShowTr(models, otr, user)) {
      result.push(otr)
      for (const atr of transactions.filter(tr => tr.originId === otr._id)) {
        result.push(atr)
      }
    } else {
      result.push(convertToHidden(otr))
      for (const atr of transactions.filter(tr => tr.originId === otr._id)) {
        result.push(convertToHidden(atr))
      }
    }
  }

  return result;
}