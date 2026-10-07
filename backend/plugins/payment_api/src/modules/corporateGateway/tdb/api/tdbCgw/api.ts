import { PAYMENT_STATUS } from '~/constants';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';

export interface ITdbCgwPaymentConfig {
  configId: string;
  accountNumber: string;
  iban: string;
  accountName: string;
}

export class TdbCgwAPI {
  private config: ITdbCgwPaymentConfig;
  private models: IModels;

  constructor(config: ITdbCgwPaymentConfig, models: IModels, _domain: string) {
    if (!config?.configId) {
      throw new Error('TDB CGW configId is required');
    }

    this.config = config;
    this.models = models;
  }

  private async getConfig() {
    const config = await this.models.TdbConfigs.getConfig({
      _id: this.config.configId,
    });

    if (!config) {
      throw new Error(`TDB CGW config not found: ${this.config.configId}`);
    }

    return config;
  }

  async createInvoice(transaction: ITransactionDocument) {
    await this.getConfig();

    if (!this.config.accountNumber) {
      throw new Error('TDB CGW receiving account is not configured');
    }

    if (!this.config.iban) {
      throw new Error('TDB CGW receiving account IBAN is not configured');
    }

    return {
      accountNumber: this.config.accountNumber,
      iban: this.config.iban,
      accountName: this.config.accountName || '',
      description: transaction.description || '',
      amount: transaction.amount,
    };
  }

  async checkInvoice(_transaction: ITransactionDocument) {
    return PAYMENT_STATUS.PENDING;
  }

  async manualCheck(transaction: ITransactionDocument) {
    return this.checkInvoice(transaction);
  }

  async cancelInvoice(_transaction: ITransactionDocument) {
    return { success: true };
  }
}
