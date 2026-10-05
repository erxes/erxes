import { PAYMENT_STATUS } from '~/constants';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { OrdersApi } from '~/modules/corporateGateway/tdb/api/orders';

export interface ITdbCgwPaymentConfig {
  configId: string;
}

export class TdbCgwAPI {
  private config: ITdbCgwPaymentConfig;
  private models: IModels;
  private domain: string;

  constructor(
    config: ITdbCgwPaymentConfig,
    models: IModels,
    domain: string,
  ) {
    if (!config?.configId) {
      throw new Error('TDB CGW configId is required');
    }

    this.config = config;
    this.models = models;
    this.domain = domain;
  }

  private async getOrdersApi() {
    const config = await this.models.TdbConfigs.getConfig({
      _id: this.config.configId,
    });

    if (!config) {
      throw new Error(
        `TDB CGW config not found: ${this.config.configId}`,
      );
    }

    return new OrdersApi({
      apiUrl: config.apiUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
  }

  async createInvoice(transaction: ITransactionDocument) {
    const ordersApi = await this.getOrdersApi();

    const hppRedirectUrl =
      `${this.domain}/pl:payment/callback/tdb_cgw?transactionId=${transaction._id}`;

    return ordersApi.create({
      amount: transaction.amount,
      currency: 'MNT',
      description: transaction.description || 'Invoice',
      language: 'mn',
      hppRedirectUrl,
    });
  }

  async checkInvoice(transaction: ITransactionDocument) {
    const order = transaction.response?.order;

    if (!order?.id || !order?.password) {
      return PAYMENT_STATUS.PENDING;
    }

    const ordersApi = await this.getOrdersApi();

    const detail = await ordersApi.get(order.id, order.password);
    const status = detail.order.status?.toUpperCase();

    if (OrdersApi.isSuccessfulStatus(status)) {
      return PAYMENT_STATUS.PAID;
    }

    switch (status) {
      case 'EXPIRED':
        return PAYMENT_STATUS.EXPIRED;

      case 'CLOSED':
      case 'DECLINED':
      case 'REFUSED':
      case 'REJECTED':
      case 'VOIDED':
        return PAYMENT_STATUS.FAILED;

      default:
        return PAYMENT_STATUS.PENDING;
    }
  }

  async manualCheck(transaction: ITransactionDocument) {
    return this.checkInvoice(transaction);
  }
}