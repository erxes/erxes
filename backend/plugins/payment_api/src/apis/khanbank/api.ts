
import { IModels } from '~/connectionResolvers';

import { PAYMENT_STATUS } from '~/constants';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';

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
  ibanAcctNo: string;
}

export class KhanbankAPI {
  private configId: string;
  private accountNumber: string;
  private ibanAcctNo: string;
  private subdomain: string;

  constructor(config: IKhanbankConfig, subdomain: string) {
 
    this.configId = config.configId;
    this.accountNumber = config.accountNumber;
    this.subdomain = subdomain;
    this.ibanAcctNo = config.ibanAcctNo || '';
  }

  async createInvoice(_transaction: ITransactionDocument) {
    // TODO: implement this after plugin communication is implemented
    try {
      // const account = await sendCommonMessage('khanbank', {
      //   subdomain: this.subdomain,
      //   action: 'accountInfo',
      //   data: { configId: this.configId, accountNumber: this.accountNumber },
      //   isRPC: true,
      //   defaultValue: null,
      // });

      // return { accountNumber: this.accountNumber, ibanAcctNo: this.ibanAcctNo, ...account };
    } catch (e) {
      return { error: e.message };
    }
  }

  private async check(transaction: ITransactionDocument) {
    try {

      // const transactionResponse = await sendCommonMessage('khanbank', {
      //   subdomain: this.subdomain,
      //   action: 'findTransaction',
      //   data: {
      //     configId: this.configId,
      //     accountNumber: this.accountNumber,
      //     type: 'income',
      //     description: transaction.description,
      //     record: transaction.response.lastRecord,
      //   },
      //   isRPC: true,
      //   defaultValue: null,
      // });

      // if (transactionResponse) {
      //   return PAYMENT_STATUS.PAID;
      // }

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
