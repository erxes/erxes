//store interest calculation

import { IModels } from '../../connectionResolver';
import { IContractDocument } from '../definitions/contracts';
import { calcInterest, getDiffDay, getFullDate } from './utils';

export default async function storeInterest(
  contract: IContractDocument,
  models: IModels,
  date?: Date
) {
  const nowDate = getFullDate(date || new Date());

  var mustStoreInterest = 0;

  const transactions = await models.Transactions.find({
    payDate: { $gt: contract.lastStoredDate }
  });

  var currentDate = getFullDate(contract.lastStoredDate);

  for await (let transaction of transactions) {
    const nextDate = getFullDate(transaction.payDate);
    const diffDays = getDiffDay(currentDate, nextDate);

    const storeInterest = calcInterest({
      balance: transaction.balance || 0,
      interestRate: contract.interestRate,
      dayOfMonth: diffDays
    });

    mustStoreInterest += storeInterest;

    //transaction update action for store insterest
    await models.Transactions.updateOne(
      { _id: transaction._id },
      {
        $set: {
          storeReaction: {
            diffDays,
            beginDate: currentDate,
            nextDate,
            storeInterest
          }
        }
      }
    );
    currentDate = nextDate;
  }

  if (transactions.length === 0) {
    const diffDays = getDiffDay(currentDate, date || new Date());

    mustStoreInterest = calcInterest({
      balance: contract.savingAmount || 0,
      interestRate: contract.interestRate,
      dayOfMonth: diffDays
    });
  } else {
    const diffDays = getDiffDay(currentDate, nowDate);

    mustStoreInterest += calcInterest({
      balance: contract.savingAmount || 0,
      interestRate: contract.interestRate,
      dayOfMonth: diffDays
    });
  }

  //contract increase store action

  await models.StoredInterest.create({
    description: `store intesest action`,
    invDate: nowDate,
    prevStoredDate: contract.lastStoredDate,
    amount: mustStoreInterest,
    contractId: contract._id,
    type: 'storedInterest'
  });

  await models.Contracts.updateOne(
    { _id: contract._id },
    {
      $set: { lastStoredDate: nowDate },
      $inc: { storedInterest: mustStoreInterest }
    }
  );
}
