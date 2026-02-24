import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import Stripe from 'stripe';

export const stripeCallbackHandler = async (models: IModels, data: any) => {
  const { type } = data;

  if (!data.data.object) {
    throw new Error('Data object is required');
  }

  if (!type) {
    throw new Error('Type is required');
  }

  if (
    !['payment_intent.succeeded', 'payment_intent.payment_failed'].includes(
      type,
    )
  ) {
    throw new Error('Invalid type');
  }

  const intentId = data.data.object.id;
  const transaction = await models.Transactions.getTransaction({
    'response.paymentIntent': intentId,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  try {
    const api = new StripeAPI(payment.config);
    const res = await api.checkInvoice(transaction);

    if (![PAYMENT_STATUS.PAID, PAYMENT_STATUS.CANCELLED].includes(res)) {
      return transaction;
    }

    transaction.status = res;
    transaction.updatedAt = new Date();

    await transaction.save();

    return transaction;
  } catch (e) {
    throw new Error(e.message);
  }
};

export interface IStripeConfig {
  secretKey: string;
  publishableKey: string;
}

export class StripeAPI {
  private secretKey: string;
  private publishableKey: string;
  private domain?: string;

  private client: Stripe;

  constructor(config: IStripeConfig, domain?: string) {
    this.secretKey = config.secretKey;
    this.publishableKey = config.publishableKey;
    this.domain = domain;

    this.client = new Stripe(this.secretKey);
  }

  async authorize() {
    try {
      await this.client.accounts.retrieve();

      return { success: true, message: 'Authorized' };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createInvoice(transaction: ITransactionDocument) {
    try {
      const intent = await this.client.paymentIntents.create({
        amount: 100 * transaction.amount,
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
        paymentIntent: intent.id,
        clientSecret: intent.client_secret,
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  private async check(transaction) {
    try {
      const res = await this.client.paymentIntents.retrieve(
        transaction.response.paymentIntent,
      );
      if (res.status === 'succeeded') {
        return PAYMENT_STATUS.PAID;
      }

      if (res.status === 'canceled') {
        return PAYMENT_STATUS.CANCELLED;
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
      await this.client.paymentIntents.cancel(invoice.response.paymentIntent);
      return { status: 'success' };
    } catch (e) {
      return { error: e.message };
    }
  }

  async getWebhooks() {
    const response = await this.client.webhookEndpoints.list();

    return response.data;
  }

  async registerWebhook(paymentId: string) {
    const webhookUrl = `${this.domain}/pl:payment/callback/${PAYMENTS.stripe.kind}?paymentId=${paymentId}`;
    try {
      const list = (await this.getWebhooks()) || [];
      if (list.findIndex((e) => e.url === webhookUrl) > -1) {
        return { status: 'success' };
      }

      await this.client.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: [
          'payment_intent.succeeded',
          'payment_intent.payment_failed',
        ],
      });

      return { status: 'success' };
    } catch (e) {
      console.error(e);
      return { error: e.message };
    }
  }
}
