import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { TR_FOLLOW_TYPES, TR_SIDES } from '../@types/constants';
import { ITransactionDocument } from '../@types/transaction';
import { getSingleJournalByAccount } from './utils';

export const InvIncomeExpenseTrs = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  const oldFollowTrs = await models.Transactions.find({ originId: transaction._id, followType: TR_FOLLOW_TYPES.INV_INCOME_EXPENSE }).lean();

  const matchedIds: string[] = [];
  const expenseInfos = transaction.extraData?.invIncomeExpenses || [];
  const withAccountExpenses = expenseInfos.filter(ei => ei.accountId);
  const accounts = await models.Accounts.find({ _id: { $in: withAccountExpenses.map(e => e.accountId) } });

  for (const expenseInfo of withAccountExpenses) {
    const account = accounts.find(a => a._id === expenseInfo.accountId);
    if (!account) {
      continue;
    }

    const followTrDoc = {
      ptrId: transaction.ptrId,
      parentId: transaction.parentId,
      originId: transaction._id,
      followType: TR_FOLLOW_TYPES.INV_INCOME_EXPENSE,
      originSubId: expenseInfo._id,
      number: transaction.number,
      date: transaction.date,
      description: transaction.description,
      journal: getSingleJournalByAccount(account.journal, account.kind),
      branchId: transaction.branchId,
      departmentId: transaction.departmentId,
      customerType: transaction.customerType,
      customerId: transaction.customerId,
      details: [{
        _id: nanoid(),
        accountId: expenseInfo.accountId,
        side: TR_SIDES.CREDIT,
        amount: expenseInfo.amount ?? 0
      }],
    };

    const oldTr = oldFollowTrs.find(oftr => oftr.originSubId === expenseInfo._id);
    if (oldTr) {
      matchedIds.push(oldTr._id);
      await models.Transactions.updateTransaction(oldTr._id, followTrDoc);
    } else {
      await models.Transactions.createTransaction(followTrDoc);
    }
  }

  const removeTrIds = oldFollowTrs.filter(oftr => !matchedIds.includes(oftr._id)).map(oftr => oftr._id);
  if (removeTrIds.length) {
    await models.Transactions.deleteMany({ _id: { $in: removeTrIds } });
  }

  return await models.Transactions.find({
    originId: transaction._id, followType: TR_FOLLOW_TYPES.INV_INCOME_EXPENSE
  }).lean();
}