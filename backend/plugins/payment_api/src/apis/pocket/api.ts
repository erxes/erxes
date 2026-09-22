import fetch from 'node-fetch';
import * as QRCode from 'qrcode';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { IPocketInvoice } from '../types';
import { redis } from 'erxes-api-shared/utils';

export interface IPocketConfig {
  pocketMerchant: string;
  pocketClientId: string;
  pocketClientSecret: string;
  pocketTerminalId: number;
}

interface IPocketCallbackData {
  paymentId: string;
  invoiceId: string | number;
  [key: string]: unknown;
}

interface IPocketTokenResponse {
  access_token: string;
  expires_in: number;
}

interface IPocketInvoiceResponse {
  id: number;
  qr: string;
  orderNumber: string;
  deeplink?: string;
}

interface IPocketInvoiceStatusResponse {
  state:
    | 'pending'
    | 'processing'
    | 'processed'
    | 'paid'
    | 'cancelled'
    | 'rejected'
    | 'unsuccess';
  description?: string;
  amount?: number;
  info?: string;
  id?: number;
  terminalId?: number;
  orderNumber?: string;
  invoiceType?: string;
}

/**
 * Handles Pocket payment callbacks and updates the transaction status.
 */
export const pocketCallbackHandler = async (
  models: IModels,
  data: IPocketCallbackData,
) => {
  const { paymentId, invoiceId } = data;

  if (!paymentId) {
    throw new Error('Payment id is required');
  }

  if (!invoiceId) {
    throw new Error('Pocket invoice id is required');
  }

  const transaction = await models.Transactions.getTransaction({
    'response.invoiceId': invoiceId,
    paymentId,
  });

  const response = (transaction.response || {}) as Record<string, unknown>;

  const allowedCallbackKeys = [
    'invoiceId',
    'paymentId',
    'state',
    'description',
    'amount',
    'info',
    'id',
    'terminalId',
    'orderNumber',
    'invoiceType',
  ];

  for (const key of allowedCallbackKeys) {
    if (key in data) {
      response[key] = data[key];
    }
  }

  transaction.response = response;

  const payment = await models.PaymentMethods.getPayment(paymentId);

  if (payment.kind !== PAYMENTS.pocket.kind) {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new PocketAPI(payment.config);
    const status = await api.checkInvoice(transaction);

    if (status !== PAYMENT_STATUS.PAID) {
      transaction.status = status;
      transaction.updatedAt = new Date();
      await transaction.save();

      return transaction;
    }

    transaction.status = PAYMENT_STATUS.PAID;
    transaction.updatedAt = new Date();

    await transaction.save();

    return transaction;
  } catch (e) {
    throw new Error(e.message);
  }
};

export class PocketAPI extends BaseAPI {
  private pocketMerchant: string;
  private pocketClientId: string;
  private pocketClientSecret: string;
  private pocketTerminalId: number;
  private domain?: string;

  constructor(config: IPocketConfig, domain?: string) {
    super(config);

    if (
      !Number.isInteger(config.pocketTerminalId) ||
      config.pocketTerminalId <= 0
    ) {
      throw new Error('Pocket terminal ID must be a valid positive integer');
    }

    this.pocketMerchant = config.pocketMerchant;
    this.pocketClientId = config.pocketClientId;
    this.pocketClientSecret = config.pocketClientSecret;
    this.pocketTerminalId = config.pocketTerminalId;

    this.domain = domain;
    this.apiUrl = PAYMENTS.pocket.apiUrl;
  }

  async getHeaders() {
    const tokenKey = `pocket_token_${this.pocketMerchant}`;

    const token = await redis.get(tokenKey);

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    const requestBody = new URLSearchParams({
      client_id: this.pocketClientId,
      client_secret: this.pocketClientSecret,
      grant_type: 'client_credentials',
    }).toString();

    const authUrl =
      'https://sso.invescore.mn/auth/realms/invescore/protocol/openid-connect/token';

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    const res: IPocketTokenResponse = await response.json();

    if (!response.ok || !res.access_token) {
      throw new Error(
        `Pocket token request failed: ${response.status} ${JSON.stringify(
          res,
        )}`,
      );
    }

    const expiresIn = Number(res.expires_in || 600);

    await redis.set(
      tokenKey,
      res.access_token,
      'EX',
      Math.max(expiresIn - 60, 1),
    );

    return {
      Authorization: `Bearer ${res.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async createInvoice(transaction: ITransactionDocument) {
    try {
      const orderNumber = transaction.code;

      const data: IPocketInvoice = {
        terminalId: this.pocketTerminalId,
        amount: transaction.amount,
        info: transaction.description || '',
        orderNumber,
        invoiceType: 'ZERO',
        channel: 'ecommerce',
      };

      const response = await this.request({
        method: 'POST',
        path: PAYMENTS.pocket.actions.invoice,
        headers: await this.getHeaders(),
        data,
      });

      const res: IPocketInvoiceResponse = await response.json();

      if (!response.ok || !res.id) {
        throw new Error(
          `Pocket invoice creation failed: ${response.status} ${JSON.stringify(
            res,
          )}`,
        );
      }

      if (!res.qr || typeof res.qr !== 'string') {
        throw new Error(
          `Pocket invoice response does not contain a valid QR: ${JSON.stringify(
            res,
          )}`,
        );
      }

      return {
        ...res,
        invoiceId: res.id,
        terminalId: this.pocketTerminalId,
        orderNumber: res.orderNumber || orderNumber,
        qrData: await QRCode.toDataURL(res.qr),
      };
    } catch (e) {
      console.error('[POCKET] createInvoice error:', e);

      return {
        error: e.message,
      };
    }
  }

  /**
   * Checks the current payment status of a Pocket invoice.
   */
  async checkInvoice(transaction: ITransactionDocument) {
    const invoiceId = transaction.response?.invoiceId;

    if (!invoiceId) {
      throw new Error('Pocket invoice id is missing');
    }

    const response = await this.request({
      method: 'POST',
      path: PAYMENTS.pocket.actions.checkInvoice,
      headers: await this.getHeaders(),
      data: {
        terminalId: this.pocketTerminalId,
        invoiceId: Number(invoiceId),
      },
    });

    const res: IPocketInvoiceStatusResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        `Pocket invoice check failed: ${response.status} ${JSON.stringify(
          res,
        )}`,
      );
    }

    if (res.state === 'paid') {
      return PAYMENT_STATUS.PAID;
    }

    if (PAYMENT_STATUS.ALL.includes(res.state)) {
      return res.state;
    }

    return PAYMENT_STATUS.PENDING;
  }

  /**
   * Manually checks the current status of a Pocket transaction.
   */
  manualCheck(transaction: ITransactionDocument) {
    return this.checkInvoice(transaction);
  }

  /**
   * Registers the payment callback URL with Pocket.
   */
  async registerWebhook(paymentId: string) {
    try {
      await this.request({
        method: 'POST',
        path: PAYMENTS.pocket.actions.webhook,
        headers: await this.getHeaders(),
        data: {
          fallBackUrl: `${this.domain}/pl:payment/callback/${PAYMENTS.pocket.kind}?paymentId=${paymentId}`,
        },
      });
    } catch (e) {
      console.error('[POCKET] registerWebhook error:', e);

      return {
        error: e.message,
      };
    }
  }
}
