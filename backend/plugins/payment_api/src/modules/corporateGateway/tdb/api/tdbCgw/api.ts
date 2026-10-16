import { PAYMENT_STATUS } from '~/constants';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { AccountsApi } from '../accounts';
export interface ITdbCgwPaymentConfig {
  configId: string;
  accountNumber: string;
  iban: string;
  accountName: string;
}

export class TdbCgwAPI {
  private readonly config: ITdbCgwPaymentConfig;
  private readonly models: IModels;

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

  async checkInvoice(transaction: ITransactionDocument) {
    const config = await this.getConfig();

    const accountsApi = new AccountsApi({
      apiUrl: config.apiUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    const description = transaction.description?.trim();

    if (!description) {
      return PAYMENT_STATUS.PENDING;
    }

    const createdAt = new Date(transaction.createdAt);
    const now = new Date();

    const formatDate = (date: Date) =>
      `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}/${String(date.getDate()).padStart(2, '0')}`;

    const matchedTransaction = await accountsApi.findTransaction({
      accountNumberOrIban: this.config.iban || this.config.accountNumber,
      amount: transaction.amount,
      description,
      from: formatDate(createdAt),
      to: formatDate(now),
    });

    return matchedTransaction ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING;
  }

  async manualCheck(transaction: ITransactionDocument) {
    return this.checkInvoice(transaction);
  }

  cancelInvoice(_transaction: ITransactionDocument) {
    return { success: true };
  }
}
