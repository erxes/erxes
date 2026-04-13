import { IModels } from "~/connectionResolvers";
import { PTR_STATUSES, TR_SIDES } from "../../@types/constants";
import { ITransaction, ITransactionDocument } from "../../@types/transaction";
import { IAccountDocument } from '../../@types/account';

const getAccountIdsOnTr = async (models: IModels, transactions: ITransactionDocument[]) => {
  const accountsById: { [_id: string]: any } = {};
  const accountIds = transactions.reduce(
    (
      ids: string[], tr: ITransactionDocument
    ) => ids.concat(
      (tr.details || []).map(d => d.accountId)
    ),
    []
  );

  const accounts = await models.Accounts.find({ _id: { $in: accountIds } }, { _id: 1, code: 1, isOutBalance: 1 }).lean();
  for (const acc of accounts) {
    accountsById[acc._id] = acc;
  }
  return { accountsById, accounts };
}

const getPtrStatus = async (models: IModels, transactions: ITransactionDocument[], accounts: IAccountDocument[]) => {
  let balance = 0;
  for (const tr of transactions) {
    balance += tr.sumDt - tr.sumCt;
  }

  if (balance > 0.005 || balance < -0.005) {
    return PTR_STATUSES.DIFF;
  }

  const balanceTypes = [...new Set(accounts.map((acc) => acc.isOutBalance))];
  if (balanceTypes.length > 1) {
    return PTR_STATUSES.ACCOUNT_BALANCE
  }

  return PTR_STATUSES.OK;
}

const getRelAccounts = (trDoc: ITransaction, transactions: ITransaction[], accountsById: { [_id: string]: string }) => {
  const dtAccountCodes: string[] = [];
  const ctAccountCodes: string[] = [];
  (transactions || []).forEach((activeTr) => {
    if (activeTr._id === trDoc._id) {
      return;
    }
    if (activeTr.ptrId !== trDoc.ptrId) {
      return;
    }

    if (activeTr.side === TR_SIDES.DEBIT) {
      activeTr.details.forEach((detail) => {
        const code = accountsById[detail.accountId]?.['code'] ?? '';
        if (!code || dtAccountCodes.includes(code)) {
          return;
        }
        dtAccountCodes.push(code);
      });
    } else {
      activeTr.details.forEach((detail) => {
        const code = accountsById[detail.accountId]?.['code'] ?? '';
        if (!code || ctAccountCodes.includes(code)) {
          return;
        }
        ctAccountCodes.push(code);
      });
    }
  });

  return {
    dt: dtAccountCodes,
    ct: ctAccountCodes
  }
}

export const setPtrStatus = async (models: IModels, transactions: ITransactionDocument[]) => {
  const trsByPtrId = {};
  const relAccountsByTrId = {};
  const { accounts, accountsById } = await getAccountIdsOnTr(models, transactions);
  let mainPtrId = '';
  let resultStatus = PTR_STATUSES.DIFF;

  const bulkOps: {
    updateOne: {
      filter: { _id: string };
      update: any;
    };
  }[] = [];

  for (const tr of transactions) {
    if (!Object.keys(trsByPtrId).includes(tr.ptrId)) {
      trsByPtrId[tr.ptrId] = [];
    }
    if (!mainPtrId && !tr.originId) {
      mainPtrId = tr.ptrId
    }

    trsByPtrId[tr.ptrId].push(tr);

    relAccountsByTrId[tr._id] = getRelAccounts(tr, transactions, accountsById)
  }

  const ptrIds = Object.keys(trsByPtrId);

  for (const ptrId of ptrIds) {
    const trs = trsByPtrId[ptrId];
    const status = await getPtrStatus(models, trs, accounts);

    for (const tr of trs) {
      bulkOps.push({
        updateOne: {
          filter: { _id: tr._id },
          update: {
            $set: {
              'relAccounts.dt': relAccountsByTrId[tr._id]?.dt,
              'relAccounts.ct': relAccountsByTrId[tr._id]?.ct,
              ptrStatus: status,
            }
          }
        }
      })
    }

    if (ptrId === mainPtrId) {
      resultStatus = status;
    }
  }

  if (bulkOps.length) {
    await models.Transactions.bulkWrite(bulkOps);
  }

  return resultStatus;
}
