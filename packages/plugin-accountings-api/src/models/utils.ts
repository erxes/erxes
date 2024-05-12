import { IModels } from "../connectionResolver";
import { PTR_STATUSES } from "./definitions/constants";
import { ITransactionDocument } from "./definitions/transaction";

export const getPtrStatus = async (models: IModels, transactions: ITransactionDocument[]) => {
  let balance = 0;
  for (const tr of transactions) {
    balance += tr.sumDt - tr.sumCt;
  }

  if (balance > 0.005 || balance < -0.005) {
    return PTR_STATUSES.DIFF;
  }

  const accountIds = transactions.reduce((ids: string[], tr: ITransactionDocument) => ids.concat((tr.details || []).map(d => d.accountId)), [])
  const accounts = await models.Accounts.find({ _id: { $in: accountIds } });

  const balanceTypes = [...new Set(accounts.map(a => a.isOutBalance))];
  if (balanceTypes.length > 1) {
    return PTR_STATUSES.ACCOUNT_BALANCE
  }

  return PTR_STATUSES.OK;
}

export const setPtrStatus = async (models: IModels, transactions: ITransactionDocument[]) => {
  const status = await getPtrStatus(models, transactions);
  await models.Transactions.updateMany({ _id: { $in: transactions.map(tr => tr._id) } }, { $set: { ptrStatus: status } });

  return status;
}
