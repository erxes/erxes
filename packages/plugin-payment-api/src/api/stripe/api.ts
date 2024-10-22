import { IModels } from '../../connectionResolver';
import { ITransactionDocument } from '../../models/definitions/transactions';
import redis from '@erxes/api-utils/src/redis';
import Stripe from 'stripe';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import transaction from '../../graphql/resolvers/transaction';

// export const qpayCallbackHandler = async (models: IModels, data: any) => {
//   const { _id } = data;

//   if (!_id) {
//     throw new Error('Transaction id is required');
//   }

//   const transaction = await models.Transactions.getTransaction({
//     _id,
//   });

//   const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

//   if (payment.kind !== 'qpay') {
//     throw new Error('Payment config type is mismatched');
//   }

//   try {
//     const api = new QpayAPI(payment.config);
//     const status = await api.checkInvoice(transaction);

//     if (status !== PAYMENT_STATUS.PAID) {
//       return transaction;
//     }

//     transaction.status = status;
//     transaction.updatedAt = new Date();

//     await transaction.save();

//     return transaction;
//   } catch (e) {
//     throw new Error(e.message);
//   }
// };

export interface IStripeConfig {
  secretKey: string;
  publishableKey: string;
}

export class StripeAPI {
  private secretKey: string;
  private publishableKey: string;
  private domain?: string;

  private client: Stripe;

  constructor(config: StripeAPI, domain?: string) {
    this.secretKey = config.secretKey;
    this.publishableKey = config.publishableKey;
    this.domain = domain;

    this.client = new Stripe(this.secretKey);
  }

  async createInvoice(transaction: ITransactionDocument) {
    try {
      const intent = await this.client.paymentIntents.create({
        amount: transaction.amount,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          invoiceId: transaction.invoiceId,
          transactionId: transaction._id,
        },
      });

      return {
        clientSecret: intent.client_secret,
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  private async check(transaction) {
    // try {
    //   const res = await this.request({
    //     method: 'GET',
    //     path: `${PAYMENTS.qpay.actions.invoice}/${transaction.response.invoice_id}`,
    //     headers: await this.getHeaders(),
    //   }).then((r) => r.json());

    //   if (res.invoice_status === 'CLOSED') {
    //     return PAYMENT_STATUS.PAID;
    //   }

    //   return PAYMENT_STATUS.PENDING;
    // } catch (e) {
    //   throw new Error(e.message);
    // }
  }

  async checkInvoice(transaction: ITransactionDocument) {
    // return PAYMENT_STATUS.PAID;
    // return this.check(transaction);
  }

  async manualCheck(transaction: ITransactionDocument) {
    // return this.check(transaction);
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    // try {
    //   await this.request({
    //     method: 'DELETE',
    //     path: `${PAYMENTS.qpay.actions.invoice}/${invoice.response.invoice_id}`,
    //     headers: await this.getHeaders(),
    //   });
    // } catch (e) {
    //   return { error: e.message };
    // }
  }
}
