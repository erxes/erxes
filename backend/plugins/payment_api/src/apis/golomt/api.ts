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
} from 'erxes-api-shared/utils';
import { splitType } from 'erxes-api-shared/core-modules';

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};

export const notificationHandler = async (
  models: IModels,
  subdomain: string,
  data: any,
  res: any,
) => {
  const { errorCode, transactionId, errorDesc } = data;

  if (errorCode !== '000') {
    res.status(400).json({ status: 'error', message: errorDesc });
    return;
  }

  const transaction = await models.Transactions.getTransaction({
    'details.golomtTransactionId': transactionId,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'golomt') {
    res
      .status(400)
      .json({ status: 'error', message: 'Payment method kind is mismatched' });
    return;
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

    graphqlPubsub.publish(`transactionUpdated:${transaction.invoiceId}`, {
      transactionUpdated: {
        _id: transaction._id,
        status: 'paid',
        amount: transaction.amount,
        paymentKind: transaction.paymentKind,
      },
    });
    const invoice = await models.Invoices.getInvoice({
      _id: transaction.invoiceId,
    });
    const result = await models.Invoices.checkInvoice(invoice._id, subdomain);

    if (result === 'paid') {
      graphqlPubsub.publish(`invoiceUpdated:${invoice._id}`, {
        invoiceUpdated: {
          _id: transaction.invoiceId,
          status: 'paid',
        },
      });
    }

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
            ...transaction,
            moduleName,
            collectionType,
            apiResponse: 'success',
          },
          defaultValue: null,
        });

        if (result === 'paid') {
          await sendWorkerMessage({
            subdomain,
            pluginName,
            queueName: 'payments',
            jobName: 'callback',
            data: {
              ...invoice,
              moduleName,
              collectionType,
              status: 'paid',
            },
            defaultValue: null,
          });

          if (invoice.callback) {
            try {
              await fetch(invoice.callback, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  _id: invoice._id,
                  amount: invoice.amount,
                  status: 'paid',
                }),
              });
            } catch (e) {
              console.error('Error: ', e);
            }
          }
        }
      } catch (e) {
        console.error('Error: ', e);
      }
    }
  } catch (e) {
    throw new Error(e.message);
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
  const transactionId = random('aA0', 10);

  const message = `${transactionId}1GET${callback}`;
  const checksum = hmac256(this.key, message);

  const data: IGolomtInvoice = {
    amount: '1',
    checksum,
    transactionId,
    genToken: 'N',
    socialDeeplink: 'Y',
    callback,
    returnType: 'GET',
  };

  console.log('========== GOLOMT AUTHORIZE REQUEST ==========');
  console.dir(
    {
      url: `${this.apiUrl}/${PAYMENTS.golomt.actions.invoice}`,
      merchant: this.merchant,
      callback,
      transactionId,
      checksum,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token.substring(0, 10)}...`,
      },
      body: data,
    },
    { depth: null },
  );

  try {
    const response = await this.request({
      path: PAYMENTS.golomt.actions.invoice,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      data,
    });

    const body = await response.text();

    console.log('========== GOLOMT AUTHORIZE RESPONSE ==========');
    console.log({
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
    });

    console.log('========== GOLOMT RESPONSE BODY ==========');
    console.log(body);

    let res;

    try {
      res = JSON.parse(body);
    } catch {
      console.error('========== GOLOMT INVALID RESPONSE ==========');
      console.error(body);

      throw new Error(
        `Golomt returned non-JSON response. Status=${response.status}`,
      );
    }

    if (!response.ok) {
      console.error('========== GOLOMT HTTP ERROR ==========');
      console.dir(res, { depth: null });

      throw new Error(res.message || JSON.stringify(res));
    }

    if (res.status && res.status !== 200) {
      console.error('========== GOLOMT API ERROR ==========');
      console.dir(res, { depth: null });

      throw new Error(res.message || JSON.stringify(res));
    }

    console.log('========== GOLOMT AUTHORIZE SUCCESS ==========');
    console.dir(res, { depth: null });

    return { success: true, message: 'Authorized' };
  } catch (e: any) {
    console.error('========== GOLOMT AUTHORIZE FAILED ==========');
    console.error({
      merchant: this.merchant,
      callback,
      transactionId,
      error: e.message,
      stack: e.stack,
    });

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