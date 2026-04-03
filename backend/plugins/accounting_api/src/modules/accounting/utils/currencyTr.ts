import dayjs from 'dayjs';
import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { getCoreConfig } from '~/init-trpc';
import { JOURNALS, TR_FOLLOW_TYPES, TR_SIDES } from '../@types/constants';
import { ITransaction, ITransactionDocument } from '../@types/transaction';
import { createOrUpdateTr } from './utils';

export default class CurrencyTr {
  private models: IModels;
  private subdomain: string;
  private doc: ITransaction;
  private currencyDiffTrDoc?: ITransaction;
  private spotRate?: any;

  constructor(models: IModels, subdomain: string, doc: ITransaction) {
    this.subdomain = subdomain;
    this.models = models;
    this.doc = doc;
  }

  public checkValidationCurrency = async () => {
    const detail = this.doc.details[0];
    if (!detail) {
      throw new Error('has not detail');
    }

    const mainCurrency = await getCoreConfig(
      this.subdomain,
      'mainCurrency',
      '',
    );

    const account = await this.models.Accounts.getAccount({
      _id: detail.accountId,
    });
    if (mainCurrency === account.currency) {
      return;
    }

    if (!detail.currencyAmount) {
      throw new Error('must fill Currency Amount');
    }

    this.spotRate = await sendTRPCMessage({
      subdomain: this.subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'exchangeRates',
      action: 'getActiveRate',
      input: {
        date: dayjs(this.doc.date).format('YYYY-MM-DD'),
        rateCurrency: account.currency,
        mainCurrency,
      },
      defaultValue: {},
    });

    if (!this.spotRate?.rate) {
      throw new Error('not found spot rate');
    }
    const spotRate = this.spotRate.rate;

    if (
      detail.customRate &&
      spotRate !== detail.customRate &&
      !detail.followInfos?.currencyDiffAccountId
    ) {
      throw new Error('must fill currency diff account');
    }

    if (
      detail.customRate &&
      spotRate !== detail.customRate &&
      detail.followInfos.currencyDiffAccountId
    ) {
      const rateDiff = detail.customRate - spotRate;
      let amount = detail.currencyAmount * rateDiff;

      let side = detail.side;
      if (amount < 0) {
        side =
          TR_SIDES.DEBIT === detail.side ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
        amount = -1 * amount;
      }

      this.currencyDiffTrDoc = {
        ptrId: this.doc.ptrId,
        parentId: this.doc.parentId,
        number: this.doc.number,
        date: this.doc.date,
        description: this.doc.description,
        journal: JOURNALS.EXCHANGE_DIFF,
        branchId: this.doc.branchId,
        departmentId: this.doc.departmentId,
        customerType: this.doc.customerType,
        customerId: this.doc.customerId,
        details: [
          {
            _id: nanoid(),
            accountId: detail.followInfos.currencyDiffAccountId,
            side,
            amount,
          },
        ],
      };

      return this.currencyDiffTrDoc;
    }
  };

  public cleanDoc = async () => {
    if (!this.currencyDiffTrDoc) {
      return this.doc;
    }

    const detail = this.doc.details[0];
    const amount =
      fixNum((detail.currencyAmount ?? 0) * (this.spotRate?.rate ?? 0)) ||
      detail.amount ||
      0;

    if (amount !== detail.amount) {
      detail.amount = amount;
    }

    return this.doc;
  };

  public doCurrencyTr = async (transaction: ITransactionDocument) => {
    let currencyTr;

    const oldFollowTrs = await this.models.Transactions.find({
      originId: transaction._id,
      originType: TR_FOLLOW_TYPES.EXCHANGE_DIFF,
    }).lean();

    if (!this.currencyDiffTrDoc) {
      if (oldFollowTrs.length) {
        await this.models.Transactions.deleteMany({
          _id: { $in: oldFollowTrs.map((tr) => tr._id) },
        });
      }

      return;
    }

    const oldCurrencyTr = oldFollowTrs[0];
    if (oldFollowTrs.length > 1) {
      await this.models.Transactions.deleteMany({
        _id: { $in: oldFollowTrs.slice(1).map((tr) => tr._id) },
      });
    }

    currencyTr = await createOrUpdateTr(
      this.models,
      {
        ...this.currencyDiffTrDoc,
        originId: transaction._id,
        originType: TR_FOLLOW_TYPES.EXCHANGE_DIFF,
        parentId: transaction.parentId,
        ptrId: transaction.ptrId,
      },
      oldCurrencyTr,
    );

    return currencyTr;
  };
}
