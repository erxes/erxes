import { IModels } from "~/connectionResolvers";
import { PTR_STATUSES } from "../../@types/constants";
import { ITransactionDocument } from "../../@types/transaction";

export const getPtrStatus = async (models: IModels, transactions: ITransactionDocument[]) => {
  let balance = 0;
  for (const tr of transactions) {
    balance += tr.sumDt - tr.sumCt;
  }

  if (balance > 0.005 || balance < -0.005) {
    return PTR_STATUSES.DIFF;
  }

  const accountIds = transactions.reduce(
    (
      ids: string[], tr: ITransactionDocument
    ) => ids.concat(
      (tr.details || []).map(d => d.accountId)
    ),
    []
  );

  const accounts = await models.Accounts.find({ _id: { $in: accountIds } });

  const balanceTypes = [...new Set(accounts.map(a => a.isOutBalance))];
  if (balanceTypes.length > 1) {
    return PTR_STATUSES.ACCOUNT_BALANCE
  }

  return PTR_STATUSES.OK;
}

export const setPtrStatus = async (models: IModels, transactions: ITransactionDocument[]) => {
  const trsByPtrId = {};
  let mainPtrId = '';
  let resultStatus = PTR_STATUSES.DIFF;

  for (const tr of transactions) {
    if (!Object.keys(trsByPtrId).includes(tr.ptrId)) {
      trsByPtrId[tr.ptrId] = [];
    }
    if (!mainPtrId && !tr.originId) {
      mainPtrId = tr.ptrId
    }

    trsByPtrId[tr.ptrId].push(tr);
  }

  const ptrIds = Object.keys(trsByPtrId);

  for (const ptrId of ptrIds) {
    const trs = trsByPtrId[ptrId];
    const status = await getPtrStatus(models, trs);

    await models.Transactions.updateMany({ _id: { $in: trs.map(tr => tr._id) } }, { $set: { ptrStatus: status } });
    if (ptrId === mainPtrId) {
      resultStatus = status;
    }
  }

  return resultStatus;
}
