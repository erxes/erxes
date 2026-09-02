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
  private readonly userId: string;
  private doc: ITransaction;
  private currencyDiffTrDoc?: ITransaction;
  private spotRate?: any;

  constructor(
    models: IModels,
    subdomain: string,
    userId: string,
    doc: ITransaction,
  ) {
    this.subdomain = subdomain;
    this.models = models;
    this.doc = doc;
    this.userId = userId;
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
      pluginName: 'mongolian',
      module: 'exchangeRates',
      action: 'getActiveRate',
      input: {
        date: new Date(this.doc.date),
        rateCurrency: account.currency,
        mainCurrency,
      },
      defaultValue: {},
    });

    const spotRate = Number(this.spotRate?.rate || 0);
    const customRate = Number(detail.customRate || 0);
    const hasRateDiff =
      !!customRate && Math.abs(fixNum(customRate - spotRate, 8)) > 0;

    if (!spotRate) {
      throw new Error(`exchange rate not found: ${account.currency}`);
    }

    if (hasRateDiff && !detail.followInfos?.currencyDiffAccountId) {
      throw new Error('must fill currency diff account');
    }

    if (hasRateDiff && detail.followInfos.currencyDiffAccountId) {
      const rateDiff = customRate - spotRate;
      let amount = fixNum(detail.currencyAmount * rateDiff, 4);

      let side = this.doc.side;
      if (amount < 0) {
        side = TR_SIDES.DEBIT === side ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
        amount = -1 * amount;
      }

      this.currencyDiffTrDoc = {
        ptrId: this.doc.ptrId,
        parentId: this.doc.parentId,
        number: this.doc.number,
        date: this.doc.date,
        description: this.doc.description,
        journal: JOURNALS.EXCHANGE_DIFF,
        side,
        branchId: this.doc.branchId,
        departmentId: this.doc.departmentId,
        customerType: this.doc.customerType,
        customerId: this.doc.customerId,
        details: [
          {
            _id: nanoid(),
            accountId: detail.followInfos.currencyDiffAccountId,
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

    return await createOrUpdateTr(
      this.models,
      this.userId,
      {
        ...this.currencyDiffTrDoc,
        originId: transaction._id,
        originType: TR_FOLLOW_TYPES.EXCHANGE_DIFF,
        parentId: transaction.parentId,
        ptrId: transaction.ptrId,
      },
      oldCurrencyTr,
    );
  };
}
