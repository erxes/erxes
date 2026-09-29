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
    console.log('[KHANBANK] checkInvoice START', {
      transactionId: transaction._id,
      amount: transaction.amount,
      description: transaction.description,
      accountNumber: this.config.accountNumber,
      lastRecord: transaction.response?.lastRecord || 0,
    });

    const khanbank = await this.getKhanbank();

    const matchedTransaction =
      await khanbank.statements.findTransaction({
        accountNumber: this.config.accountNumber,
        amount: transaction.amount,
        description: transaction.description,
        record: transaction.response?.lastRecord || 0,
      });

    if (matchedTransaction) {
      transaction.response = matchedTransaction;
      return PAYMENT_STATUS.PAID;
    }

    return PAYMENT_STATUS.PENDING;
  }

  async manualCheck(transaction: ITransactionDocument) {
    console.log('[KHANBANK] manualCheck called', {
      transactionId: transaction._id,
    });

    return this.checkInvoice(transaction);
  }

  async cancelInvoice(_transaction: ITransactionDocument) {
    return { success: true };
  }
}