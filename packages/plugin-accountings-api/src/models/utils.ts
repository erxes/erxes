import { IModels } from "../connectionResolver";
import { PTR_STATUSES } from "./definitions/constants";
import { ITransactionDocument } from "./definitions/transaction";

export const getPtrStatus = async (transactions: ITransactionDocument[]) => {
  let balance = 0;
  for (const tr of transactions) {
    balance += tr.sumDt - tr.sumCt;
  }

  if (balance > 0.005) {
    return PTR_STATUSES.DT;
  }

  if (balance < -0.005) {
    return PTR_STATUSES.CT;
  }

  return PTR_STATUSES.OK;
}

export const setPtrStatus = async (models: IModels, transactions: ITransactionDocument[]) => {
  const status = await getPtrStatus(transactions);
  await models.Transactions.updateMany({ _id: { $in: transactions.map(tr => tr._id) } }, { $set: { ptrStatus: status } });
}
