import { PAYMENT_STATUS } from '~/constants';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import Khanbank from '~/modules/corporateGateway/khanbank/khanbank/khanbank';

export interface IKhanbankConfig {
  configId: string;
  accountNumber: string;
  ibanAcctNo?: string;
}

export class KhanbankAPI {
  private config: IKhanbankConfig;
  private models: IModels;

  constructor(config: IKhanbankConfig, models: IModels) {
    if (!config?.configId) {
      throw new Error('Khanbank configId is required');
    }

    if (!config?.accountNumber) {
      throw new Error('Khanbank account number is required');
    }

    this.config = config;
    this.models = models;
  }

  private async getKhanbank() {
    const config = await this.models.KhanbankConfigs.getConfig({
      _id: this.config.configId,
    });

    if (!config) {
      throw new Error(
        `Khanbank config not found: ${this.config.configId}`,
      );
    }

    return new Khanbank(config);
  }

  async createInvoice(transaction: ITransactionDocument) {
    return {
      accountNumber: this.config.accountNumber,
      ibanAcctNo: this.config.ibanAcctNo || '',
      description: transaction.description || '',
      amount: transaction.amount,
    };
  }

  async checkInvoice(transaction: ITransactionDocument) {
    const khanbank = await this.getKhanbank();

    // a payment cannot be older than its invoice; a few minutes of slack
    // covers clock differences between erxes and the bank
    const since = new Date(
      new Date(transaction.createdAt).getTime() - 5 * 60 * 1000,
    );

    const candidates = await khanbank.statements.findTransactions({
      accountNumber: this.config.accountNumber,
      amount: transaction.amount,
      description: transaction.description,
      since,
    });

    if (!candidates.length) {
      return PAYMENT_STATUS.PENDING;
    }

    // one bank payment pays one invoice: skip statement lines another
    // transaction has already been matched to
    const used = await this.models.Transactions.find(
      {
        _id: { $ne: transaction._id },
        paymentId: transaction.paymentId,
        'response.matched.record': {
          $in: candidates.map((item: any) => item.record),
        },
      },
      { 'response.matched.record': 1 },
    ).lean();

    const usedRecords = new Set(
      used.map((item: any) => item.response?.matched?.record),
    );

    const matchedTransaction = candidates.find(
      (item: any) => !usedRecords.has(item.record),
    );

    if (!matchedTransaction) {
      return PAYMENT_STATUS.PENDING;
    }

    transaction.response = {
      ...transaction.response,
      matched: matchedTransaction,
    };

    return PAYMENT_STATUS.PAID;
  }

  async manualCheck(transaction: ITransactionDocument) {

    return this.checkInvoice(transaction);
  }

  async cancelInvoice(_transaction: ITransactionDocument) {
    return { success: true };
  }
}