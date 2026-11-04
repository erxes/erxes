import * as crypto from 'crypto';

import { IModels } from '~/connectionResolvers';

import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { IGolomtInvoice } from '~/apis/types';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import {
  graphqlPubsub,
  isEnabled,
  random,
  sendWorkerMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { splitType } from 'erxes-api-shared/core-modules';

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};

/**
 * Golomt push notification (server-to-server). Golomt recommends it over the
 * browser redirect, which is lost when the customer closes the page. It has
 * to be enabled for the merchant on Golomt's side, pointing at
 * /pl:payment/notification/golomt.
 *
 * The payload is never trusted: the transaction is re-checked with Golomt's
 * inquiry API before anything is marked paid.
 */
export const notificationHandler = async (
  models: IModels,
  subdomain: string,
  data: any,
  res: any,
) => {
  const { errorCode, transactionId, errorDesc } = data || {};

  if (!transactionId) {
    return res
      .status(400)
      .json({ status: 'error', message: 'transactionId is required' });
  }

  if (errorCode !== '000') {
    // unsuccessful payment: nothing to update, acknowledge it
    return res.status(200).json({ status: 'ok', message: errorDesc });
  }

  // The id sent to Golomt is the transaction _id, unless the transaction
  // carries its own golomtTransactionId (see createInvoice).
  const transaction = await models.Transactions.findOne({
    $or: [
      { _id: transactionId },
      { 'details.golomtTransactionId': transactionId },
    ],
  });

  if (!transaction) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Transaction not found' });
  }

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== PAYMENTS.golomt.kind) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Payment method kind is mismatched' });
  }

  const api = new GolomtAPI(payment.config);
  const status = await api.checkInvoice(transaction);

  if (status !== PAYMENT_STATUS.PAID) {
    // Push says success but the inquiry API doesn't confirm it yet.
    // Don't acknowledge, so Golomt can retry if it supports it.
    // The pending-invoice cron (#10341) re-checks it either way.
    return res
      .status(503)
      .json({ status: 'retry', message: 'payment not confirmed yet' });
  }

  await models.Transactions.updateOne(
    { _id: transaction._id, status: PAYMENT_STATUS.PENDING },
    { $set: { status: PAYMENT_STATUS.PAID, updatedAt: new Date() } },
  );

  graphqlPubsub.publish(`transactionUpdated:${transaction.invoiceId}`, {
    transactionUpdated: {
      _id: transaction._id,
      status: PAYMENT_STATUS.PAID,
      amount: transaction.amount,
      paymentKind: transaction.paymentKind,
    },
  });

  // If the invoice was already paid (widget or redirect callback got there
  // first), it was already notified; don't notify again.
  const before = await models.Invoices.getInvoice(
    { _id: transaction.invoiceId },
    true,
  );
  const wasPaid = before.status === PAYMENT_STATUS.PAID;

  const result = await models.Invoices.checkInvoice(
    transaction.invoiceId,
    subdomain,
  );

  const invoice = await models.Invoices.getInvoice(
    { _id: transaction.invoiceId },
    true,
  );

  if (invoice.contentType) {
    const [pluginName, moduleName, collectionType] = splitType(
      invoice.contentType,
    );

    if (await isEnabled(pluginName)) {
      try {
        await sendWorkerMessage({
          subdomain,
          pluginName,
          queueName: 'payments',
          jobName: 'transactionCallback',
          data: {
            ...transaction.toObject(),
            status: PAYMENT_STATUS.PAID,
            moduleName,
            collectionType,
            apiResponse: 'success',
          },
          defaultValue: null,
        });
      } catch (e) {
        console.error('[golomt notification] transactionCallback failed', e);
      }
    }
  }

  if (result === PAYMENT_STATUS.PAID && !wasPaid) {
    graphqlPubsub.publish(`invoiceUpdated:${invoice._id}`, {
      invoiceUpdated: { _id: invoice._id, status: PAYMENT_STATUS.PAID },
    });

    // same notification as the invoicesCheck mutation
    if (invoice.contentType) {
      const [pluginName, moduleName, collectionType] = splitType(
        invoice.contentType,
      );

      try {
        await sendWorkerQueue(pluginName, 'payments').add(
          'callback',
          {
            subdomain,
            data: {
              ...invoice,
              status: PAYMENT_STATUS.PAID,
              moduleName,
              collectionType,
              apiResponse: 'success',
            },
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
        );
      } catch (e) {
        console.error(
          `[golomt notification] failed to queue callback for invoice ${invoice._id}`,
          e,
        );
      }
    }

    if (invoice.callback) {
      try {
        const callbackRes = await fetch(invoice.callback, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _id: invoice._id,
            amount: invoice.amount,
            status: PAYMENT_STATUS.PAID,
          }),
        });

        if (!callbackRes.ok) {
          console.error(
            `[golomt notification] callback for invoice ${invoice._id} returned HTTP ${callbackRes.status}`,
          );
        }
      } catch (e) {
        console.error(
          `[golomt notification] callback for invoice ${invoice._id} failed`,
          e,
        );
      }
    }
  }

  return res.status(200).json({ status: 'ok' });
};

export const golomtCallbackHandler = async (models: IModels, data: any) => {
  const transaction = await models.Transactions.getTransaction({
    _id: data.transactionId,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'golomt') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new GolomtAPI(payment.config);
    const status = await api.checkInvoice(transaction);

    if (status !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    transaction.status = status;
    transaction.updatedAt = new Date();

    await transaction.save();

    return transaction;
  } catch (e) {
    throw new Error(e.message);
  }
};

export interface IGolomtParams {
  merchant: string;
  key: string;
  token: string;
}

export class GolomtAPI extends BaseAPI {
  private merchant: string;
  private key: string;
  private token: string;
  private domain?: string;

  constructor(config: IGolomtParams, domain?: string) {
    super(config);
    this.merchant = config.merchant;
    this.token = config.token;
    this.key = config.key;
    this.apiUrl = PAYMENTS.golomt.apiUrl;
    this.domain = domain;
  }

  async authorize() {
    const callback = `${this.domain}/pl:payment/callback/golomt`;
    // const transactionId = randomAlphanumeric(10);

    const transactionId = random('aA0', 10);

    const data: IGolomtInvoice = {
      amount: '1',
      checksum: hmac256(this.key, transactionId + 1 + 'GET' + callback),
      transactionId,
      genToken: 'N',
      socialDeeplink: 'Y',
      callback,
      returnType: 'GET',
    };

    try {
      const res = await this.request({
        path: PAYMENTS.golomt.actions.invoice,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token,
        },
        data,
      }).then((r) => r.json());

      if (res.status && res.status !== 200) {
        throw new Error(res.message);
      }
      return { success: true, message: 'Authorized' };
    } catch (e) {
      console.error('error', e);
      throw new Error(e.message);
    }
  }

  async createInvoice(transaction: ITransactionDocument) {
    const amount = transaction.amount.toString();

    const callback = `${this.domain}/pl:payment/callback/golomt?transactionId=${transaction._id}`;

    let transactionId = transaction._id;

    if (transaction.details?.golomtTransactionId) {
      transactionId = transaction.details.golomtTransactionId;
    }

    const data: IGolomtInvoice = {
      amount,
      checksum: hmac256(this.key, transactionId + amount + 'GET' + callback),
      transactionId,
      genToken: 'N',
      socialDeeplink: 'Y',
      callback,
      returnType: 'GET',
    };

    try {
      const res = await this.request({
        path: PAYMENTS.golomt.actions.invoice,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token,
        },
        data,
      }).then((r) => r.json());
      return res;
    } catch (e) {
      console.error('error', e);
      return { error: e.message };
    }
  }

  private async check(transaction: any) {
    const transactionId =
      transaction.details?.golomtTransactionId || transaction._id;

    const data = {
      transactionId,
      checksum: hmac256(this.key, transactionId + transactionId),
    };
    try {
      const response = await this.request({
        path: PAYMENTS.golomt.actions.invoiceCheck,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token,
        },
        data,
      }).then((r) => r.json());

      if (response.status && response.status === 'SENT') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async checkInvoice(transaction: any) {
    return this.check(transaction);
  }

  async manualCheck(transaction: ITransactionDocument) {
    return this.check(transaction);
  }
}
