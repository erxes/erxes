import * as moment from 'moment';
import { nanoid } from 'nanoid';
import { IModels } from '../connectionResolver';
import { JOURNALS, TR_SIDES } from '../models/definitions/constants';
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import { getConfig, sendCoreMessage } from '../messageBroker';

export default class CurrencyTr {
  private subdomain: string;
  private models: IModels;
  private doc: ITransaction;
  private currencyDiffTrDoc?: ITransaction;
  private spotRate?: any;

  constructor(
    subdomain: string,
    models: IModels,
    doc: ITransaction
  ) {
    this.models = models;
    this.subdomain = subdomain;
    this.doc = doc;
  }

  public checkValidationCurrency = async () => {
    const detail = this.doc.details[0];
    if (!detail) {
      throw new Error('has not detail')
    }

    const mainCurrency = await getConfig(this.subdomain, 'mainCurrency', '')

    const account = await this.models.Accounts.getAccount({ _id: detail.accountId });
    if (mainCurrency === account.currency) {
      return;
    }

    if (!detail.currencyAmount) {
      throw new Error('must fill Currency Amount')
    }

    this.spotRate = await sendCoreMessage({
      subdomain: this.subdomain,
      action: 'exchangeRates.getActiveRate',
      data: {
        date: moment(this.doc.date).format('YYYY-MM-DD'),
        rateCurrency: account.currency, mainCurrency
      },
      isRPC: true,
      defaultValue: {}
    });

    if (!this.spotRate?.rate) {
      throw new Error('not found spot rate')
    }
    const spotRate = this.spotRate.rate;

    if (detail.customRate && spotRate !== detail.customRate && !detail.followInfos?.currencyDiffAccountId) {
      throw new Error('must fill currency diff account')
    }

    if (detail.customRate && spotRate !== detail.customRate && detail.followInfos.currencyDiffAccountId) {
      const rateDiff = detail.customRate - spotRate;
      let amount = detail.currencyAmount * rateDiff;

      let side = detail.side;
      if (amount < 0) {
        side = TR_SIDES.DEBIT === detail.side ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
        amount = -1 * amount;
      }

      this.currencyDiffTrDoc = {
        ptrId: this.doc.ptrId,
        parentId: this.doc.parentId,
        number: this.doc.number,
        date: this.doc.date,
        description: this.doc.description,
        journal: JOURNALS.MAIN,
        branchId: this.doc.branchId,
        departmentId: this.doc.departmentId,
        customerType: this.doc.customerType,
        customerId: this.doc.customerId,
        details: [{
          _id: nanoid(),
          accountId: detail.followInfos.currencyDiffAccountId,
          side,
          amount
        }],
      }

      return this.currencyDiffTrDoc
    }
  }

  public doCurrencyTr = async (transaction: ITransactionDocument) => {
    let currencyTr;
    const oldFollowInfo = (transaction.follows || []).find(f => f.type === 'currencyDiff');

    const amount = (transaction.details[0].currencyAmount ?? 0) * (this.spotRate?.rate ?? 0) || transaction.details[0].amount || 0;

    if (!this.currencyDiffTrDoc) {
      if (oldFollowInfo) {
        await this.models.Transactions.updateOne({ _id: transaction._id }, {
          $set: { 'details.0.amount': amount },
          $pull: {
            follows: { ...oldFollowInfo }
          }
        });
        await this.models.Transactions.deleteOne({ _id: oldFollowInfo.id })
      }
      return;
    }

    if (oldFollowInfo) {
      const oldCurrencyTr = await this.models.Transactions.findOne({ _id: oldFollowInfo.id });
      if (oldCurrencyTr) {
        await this.models.Transactions.updateTransaction(oldCurrencyTr._id, {
          ...this.currencyDiffTrDoc,
          originId: transaction._id,
          parentId: transaction.parentId
        });
        currencyTr = this.models.Transactions.findOne({ _id: oldCurrencyTr._id });

      } else {
        currencyTr = await this.models.Transactions.createTransaction({
          ...this.currencyDiffTrDoc,
          originId: transaction._id,
          parentId: transaction.parentId
        });

        await this.models.Transactions.updateOne({ _id: transaction._id }, {
          $pull: {
            follows: { ...oldFollowInfo }
          }
        });

        await this.models.Transactions.updateOne({ _id: transaction._id }, {
          $set: { 'details.0.amount': amount },
          $addToSet: {
            follows: {
              type: 'currencyDiff',
              id: currencyTr._id
            }
          }
        });
      }

    } else {
      currencyTr = await this.models.Transactions.createTransaction({
        ...this.currencyDiffTrDoc,
        originId: transaction._id,
        parentId: transaction.parentId
      });

      await this.models.Transactions.updateOne({ _id: transaction._id }, {
        $set: { 'details.0.amount': amount },
        $addToSet: {
          follows: [{
            type: 'currencyDiff',
            id: currencyTr._id
          }]
        }
      });
    }

    return currencyTr;
  }
}