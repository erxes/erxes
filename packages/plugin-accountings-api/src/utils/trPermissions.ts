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
    permission: 'hidden'
  } as IHiddenTransaction
}

const convertToWithPerm = (transaction: ITransactionDocument, perm: string) => {
  transaction.permission = perm;
  return transaction
}

const canShowTr = async (models: IModels, transaction: ITransactionDocument, user: IUserDocument) => {
  // hidden, readOnly, update, delete|full|null
  if (!user._id) {
    return 'false'
  }
  return;
}

export const checkPermissionTrs = async (models: IModels, transactions: ITransactionDocument[], user: IUserDocument) => {
  const originTrs = transactions.filter(tr => !tr.originId);

  const result: (ITransactionDocument | IHiddenTransaction)[] = [];

  for (const otr of originTrs) {
    const permStr: string | undefined = await canShowTr(models, otr, user)

    if (permStr === 'hidden') {
      result.push(convertToHidden(otr))
      for (const atr of transactions.filter(tr => tr.originId === otr._id)) {
        result.push(convertToHidden(atr))
      }
      continue;
    }

    if (permStr) {
      result.push(convertToWithPerm(otr, permStr))
      for (const atr of transactions.filter(tr => tr.originId === otr._id)) {
        result.push(convertToWithPerm(atr, permStr))
      }
      continue;
    }

    // permStr in undefined || '' || null or full
    result.push(otr)
    for (const atr of transactions.filter(tr => tr.originId === otr._id)) {
      result.push(atr)
    }
  }

  return result;
}