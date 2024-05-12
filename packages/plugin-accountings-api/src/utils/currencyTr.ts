import { nanoid } from 'nanoid';
import { ISingleTrInput, ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import { JOURNALS, TR_SIDES } from '../models/definitions/constants';
import { IModels } from '../connectionResolver';

export const checkValidationCurrency = async (models: IModels, doc: ISingleTrInput) => {
  const mainCurrency = await models.AccountingConfigs.getConfig('MainCurrency');
  const account = await models.Accounts.getAccount({ _id: doc.accountId });
  if (mainCurrency === account.currency) {
    return;
  }

  let currencyDiffTrDoc: ITransaction | undefined;

  if (!doc.currencyAmount) {
    throw new Error('must fill Currency Amount')
  }

  const spotRate = await models.ExchangeRates.findOne({ date: doc.date, mainCurrency, rateCurrency: account.currency }).lean();

  if (!spotRate || !spotRate.rate) {
    throw new Error('not found spot rate')
  }
  if (doc.customRate && spotRate !== doc.customRate && !doc.currencyDiffAccountId) {
    throw new Error('not found spot rate')
  }

  if (doc.customRate && spotRate !== doc.customRate && doc.currencyDiffAccountId) {
    const rateDiff = doc.customRate - spotRate;
    let amount = doc.currencyAmount * rateDiff;

    let side = doc.side;
    if (amount < 0) {
      side = TR_SIDES.DEBIT === doc.side ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
      amount = -1 * amount
    }

    currencyDiffTrDoc = {
      ptrId: doc.ptrId,
      parentId: doc.parentId,
      number: doc.number,
      date: doc.date,
      description: doc.description,
      journal: JOURNALS.MAIN,
      branchId: doc.branchId,
      departmentId: doc.departmentId,
      customerType: doc.customerType,
      customerId: doc.customerId,
      details: [{
        _id: nanoid(),
        accountId: doc.currencyDiffAccountId,
        side,
        amount
      }],
    }

    return currencyDiffTrDoc
  }

  return;
}

export const doCurrencyTr = async (models: IModels, transaction: ITransactionDocument, currencyDoc?: ITransaction) => {
  const oldFollowInfo = (transaction.follows || []).find(f => f.type === 'currencyDiff')

  if (!currencyDoc) {
    if (oldFollowInfo) {
      await models.Transactions.updateOne(transaction._id, {
        $pull: {
          follows: { ...oldFollowInfo }
        }
      });
    }
    return;
  }

  if (oldFollowInfo) {
    const oldCurrencyTr = await models.Transactions.findOne({ _id: oldFollowInfo.id });
    if (oldCurrencyTr) {
      await models.Transactions.updateTransaction(oldCurrencyTr._id, { ...currencyDoc, originId: transaction._id });

    } else {
      const currencyTr = await models.Transactions.createTransaction({ ...currencyDoc, originId: transaction._id });
      await models.Transactions.updateOne(transaction._id, {
        $pull: {
          follows: { ...oldFollowInfo }
        }
      })
      await models.Transactions.updateOne(transaction._id, {
        $addToSet: {
          follows: {
            type: 'currencyDiff',
            id: currencyTr._id
          }
        }
      });
    }

  } else {
    const currencyTr = await models.Transactions.createTransaction({ ...currencyDoc, originId: transaction._id });
    await models.Transactions.updateOne(transaction._id, {
      $addToSet: {
        follows: [{
          type: 'currencyDiff',
          id: currencyTr._id
        }]
      }
    });
  }
}