import { IModels } from '../../connectionResolver';
import { ITransactionDocument } from '../../models/definitions/transactions';
import redis from '@erxes/api-utils/src/redis';
import { BaseAPI } from '../base';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { IQpayInvoice } from '../types';
import { sendCommonMessage } from '../../messageBroker';

export const khanbankCallbackHandler = async (
  models: IModels,
  subdomain: string,
  data: any
) => {
  const { _id } = data;

  if (!_id) {
    throw new Error('Transaction id is required');
  }

  const transaction = await models.Transactions.getTransaction({
    $or: [{ _id }, { code: _id }],
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'khanbank') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new KhanbankAPI(payment.config, subdomain);
    const status = await api.checkInvoice(transaction);

    if (status !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    await models.Transactions.updateOne(
      { _id: transaction._id },
      { status, updatedAt: new Date() }
    );

    return models.Transactions.getTransaction({ _id: transaction._id });
  } catch (e) {
    throw new Error(e.message);
  }
};

export interface IKhanbankConfig {
  configId: string;
  accountNumber: string;
}

export class KhanbankAPI {
  private configId: string;
  private accountNumber: string;
  private subdomain: string;

  constructor(config: IKhanbankConfig, subdomain: string) {
    this.configId = config.configId;
    this.accountNumber = config.accountNumber;
    this.subdomain = subdomain;
  }

  async createInvoice(_transaction: ITransactionDocument) {
    try {
      const account = await sendCommonMessage('khanbank', {
        subdomain: this.subdomain,
        action: 'accountInfo',
        data: { configId: this.configId, accountNumber: this.accountNumber },
        isRPC: true,
        defaultValue: null,
      });

      return { accountNumber: this.accountNumber, ...account };
    } catch (e) {
      return { error: e.message };
    }
  }

  private async check(transaction) {
    try {

      const transactionResponse = await sendCommonMessage('khanbank', {
        subdomain: this.subdomain,
        action: 'findTransaction',
        data: {
          configId: this.configId,
          accountNumber: this.accountNumber,
          type: 'income',
          description: transaction.description,
          record: transaction.response.lastRecord,
        },
        isRPC: true,
        defaultValue: null,
      });

      if (transactionResponse) {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async checkInvoice(transaction: ITransactionDocument) {
    // return PAYMENT_STATUS.PAID;
    return this.check(transaction);
  }

  async manualCheck(transaction: ITransactionDocument) {
    
    return this.check(transaction);
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    try {
      //   await this.request({
      //     method: 'DELETE',
      //     path: `${PAYMENTS.qpay.actions.invoice}/${invoice.response.invoice_id}`,
      //     headers: await this.getHeaders(),
      //   });
    } catch (e) {
      return { error: e.message };
    }
  }
}
