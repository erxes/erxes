import * as crypto from 'crypto';

import { IModels } from '~/connectionResolvers';

import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { IGolomtInvoice } from '~/apis/types';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { notifyPaidInvoice } from '~/modules/payment/services/paidInvoiceNotify';
import {
  graphqlPubsub,
  isEnabled,
  random,
} from 'erxes-api-shared/utils';
import { splitType } from 'erxes-api-shared/core-modules';
import { sendTransactionCallbackOnce } from '~/utils/transactionCallback';

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
    // The per-invoice re-check (invoiceRecheck worker) re-checks it either way.
    return res
      .status(503)
      .json({ status: 'retry', message: 'payment not confirmed yet' });
  }

  // Only the request that actually moves the transaction to paid sends the
  // transaction callback, so a retried push (or a redirect callback racing
  // it) does not repeat it.
  const { modifiedCount } = await models.Transactions.updateOne(
    { _id: transaction._id, status: PAYMENT_STATUS.PENDING },
    { $set: { status: PAYMENT_STATUS.PAID, updatedAt: new Date() } },
  );

  // Claim the invoice before telling the owning plugin about the transaction,
  // in the same order as the redirect callback, so a consumer reading the
  // invoice while handling the callback already sees it paid.
  // checkInvoiceAndClaim moves the invoice to paid atomically: exactly one
  // caller gets claimed=true and notifies. notifyPaidInvoice dedupes the plugin
  // job by invoice id, retries the external callback through its queue, and
  // leaves notifyPending set for the invoice re-check worker if anything fails.
  let claim: { status: string; claimed: boolean } | undefined;
  let claimError: unknown;

  try {
    claim = await models.Invoices.checkInvoiceAndClaim(
      transaction.invoiceId,
      subdomain,
    );
  } catch (e) {
    claimError = e;
  }

  // Always tell subscribers, even if another path marked it paid first; the
  // event is idempotent and keeps an open widget from showing pending.
  graphqlPubsub.publish(`transactionUpdated:${transaction.invoiceId}`, {
    transactionUpdated: {
      _id: transaction._id,
      status: PAYMENT_STATUS.PAID,
      amount: transaction.amount,
      paymentKind: transaction.paymentKind,
    },
  });

  // Sent even if the claim failed: the transaction is paid either way, and
  // this request is the only one that will ever see modifiedCount > 0, so
  // skipping it here would lose the callback for good.
  if (modifiedCount) {
    await sendTransactionCallback(subdomain, models, transaction);
  }

  if (claimError) {
    // The invoice stays unclaimed; a redelivered push or the invoice re-check
    // worker claims it and sends the paid notification. The transaction
    // callback is not repeated then, since the transaction is already paid.
    console.error(
      `[golomt notification] failed to claim invoice ${transaction.invoiceId}`,
      claimError,
    );
    return res
      .status(503)
      .json({ status: 'retry', message: 'invoice not updated yet' });
  }

  if (claim?.status === PAYMENT_STATUS.PAID && claim.claimed) {
    try {
      await notifyPaidInvoice(models, subdomain, transaction.invoiceId);
    } catch (e) {
      // the payment itself is confirmed; the invoice re-check worker retries
      // the notification (notifyPending stays set)
      console.error(
        `[golomt notification] failed to queue paid notifications for invoice ${transaction.invoiceId}`,
        e,
      );
    }
  }

  return res.status(200).json({ status: 'ok' });
};

/**
 * Tells the plugin that owns the invoice that this transaction was paid.
 * An invoice whose contentType names a plugin that isn't enabled (e.g. the
 * 2.x "pos:orders") has no one to receive its callbacks; say so in the log
 * instead of dropping it silently.
 */
const sendTransactionCallback = async (
  subdomain: string,
  models: IModels,
  transaction: ITransactionDocument,
) => {
  // Optional post-commit step: nothing in here may throw, or the caller would
  // skip the paid notification that actually settles the order.
  try {
    const invoice = await models.Invoices.getInvoice(
      { _id: transaction.invoiceId },
      true,
    );

    if (!invoice.contentType) {
      return;
    }

    const [pluginName, moduleName, collectionType] = splitType(
      invoice.contentType,
    );

    if (!(await isEnabled(pluginName))) {
      console.warn(
        `[golomt notification] invoice ${invoice._id} has contentType "${invoice.contentType}" but plugin "${pluginName}" is not enabled; its payment callbacks have no consumer`,
      );
      return;
    }

    // At most once per transaction; the callback route may already have
    // handed it off
    await sendTransactionCallbackOnce({
      subdomain,
      pluginName,
      transactionId: String(transaction._id),
      data: {
        ...transaction.toObject(),
        status: PAYMENT_STATUS.PAID,
        moduleName,
        collectionType,
        apiResponse: 'success',
      },
    });
  } catch (e) {
    console.error(
      `[golomt notification] transactionCallback for transaction ${transaction._id} failed`,
      e,
    );
  }
};

export const golomtCallbackHandler = async (models: IModels, data: any) => {
  const transaction = await models.Transactions.getTransaction({
    _id: data.transactionId,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'golomt') {
    throw new Error('Payment config type is mismatched');
  }

  const api = new GolomtAPI(payment.config);
  const status = await api.checkInvoice(transaction);

  if (status !== PAYMENT_STATUS.PAID) {
    return transaction;
  }

  transaction.status = status;
  transaction.updatedAt = new Date();

  await transaction.save();

  return transaction;
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
      throw e;
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

    const response = await this.request({
      path: PAYMENTS.golomt.actions.invoiceCheck,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.token,
      },
      data,
    }).then((r) => r.json());

    // status SENT only means the card payment was attempted: a declined card
    // (expired, insufficient funds, ...) is also SENT, with errorCode != '000'.
    // Paid only when Golomt reports success and the full amount was withdrawn.
    if (
      response.status === 'SENT' &&
      response.errorCode === '000' &&
      Number(response.amount) >= Number(transaction.amount)
    ) {
      return PAYMENT_STATUS.PAID;
    }

    return PAYMENT_STATUS.PENDING;
  }

  async checkInvoice(transaction: any) {
    return this.check(transaction);
  }

  async manualCheck(transaction: ITransactionDocument) {
    return this.check(transaction);
  }
}