import fetch from 'node-fetch';
import { BaseAPI } from '../base';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { redis } from 'erxes-api-shared/utils';

export interface IStorePayParams {
  merchantUsername: string;
  merchantPassword: string;
  appUsername: string;
  appPassword: string;
  storeId: string;
}

interface IStorePayResponse {
  status?: string;
  value?: any;
  msgList?: Array<{
    code?: string;
    message?: string;
  }>;
  error?: string;
  error_description?: string;
  access_token?: string;
  expires_in?: number;
  isExist?: boolean;
  isConfirmed?: boolean;
  loanId?: string | number;
  depositAmount?: number;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

export const storepayCallbackHandler = async (
  models: IModels,
  data: any
): Promise<ITransactionDocument> => {
  const { id } = data;

  if (!id) {
    throw new Error('id is required');
  }

  const transaction = await models.Transactions.getTransaction(
    {
      $or: [
        { 'response.value': id },
        { 'response.value': Number(id) },
      ],
    },
    true
  );

  const payment = await models.PaymentMethods.getPayment(
    transaction.paymentId
  );

  if (payment.kind !== PAYMENTS.storepay.kind) {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new StorePayAPI(payment.config);

    // The callback only tells us which invoice changed.
    // Verify the invoice status directly with Storepay.
    const invoiceStatus = await api.checkInvoice(String(id));

    if (invoiceStatus !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    transaction.status = PAYMENT_STATUS.PAID;
    transaction.updatedAt = new Date();

    await transaction.save();

    return transaction;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export class StorePayAPI extends BaseAPI {
  private username: string;
  private password: string;
  private app_username: string;
  private app_password: string;
  private store_id: string;
  private domain?: string;

  constructor(config: IStorePayParams, domain?: string) {
    super(config);

    const {
      merchantPassword = '',
      merchantUsername = '',
      appPassword = '',
      appUsername = '',
      storeId = '',
    } = config || {};

    this.username = merchantUsername;
    this.password = merchantPassword;
    this.app_username = appUsername;
    this.app_password = appPassword;
    this.store_id = storeId;

    this.apiUrl = PAYMENTS.storepay.apiUrl;
    this.domain = domain;
  }

  /**
   * Storepay OAuth2 password grant.
   *
   * POST:
   * /merchant-uaa/oauth/token
   *
   * Query:
   * grant_type=password
   * username={merchantUsername}
   * password={merchantPassword}
   *
   * Header:
   * Authorization: Basic base64(appUsername:appPassword)
   */
  async authorize(): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const query = new URLSearchParams({
      grant_type: 'password',
      username: this.username,
      password: this.password,
    });

    const response = await fetch(
      `${this.getBaseUrl()}merchant-uaa/oauth/token?${query.toString()}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.app_username}:${this.app_password}`
          ).toString('base64')}`,
        },
      }
    );

    const res: IStorePayResponse = await response.json();

    if (!response.ok || res.error || !res.access_token) {
      if (res.error === 'invalid_client') {
        throw new Error(
          'Invalid Storepay API credentials. Please check app username and app password.'
        );
      }

      throw new Error(
        res.error_description ||
          res.error ||
          'Failed to get Storepay access token'
      );
    }

    return {
      access_token: res.access_token,
      expires_in: res.expires_in || 7200,
    };
  }

  /**
   * Get Storepay API headers.
   *
   * Access tokens are cached in Redis for their lifetime minus 60 seconds.
   */
  async getHeaders() {
    const tokenKey = `storepay_token_${this.store_id}`;

    const token = await redis.get(tokenKey);

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    const auth = await this.authorize();

    await redis.set(
      tokenKey,
      auth.access_token,
      'EX',
      Math.max(auth.expires_in - 60, 60)
    );

    return {
      Authorization: `Bearer ${auth.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a Storepay invoice.
   *
   * Storepay v3.0:
   * POST /merchant/loan
   *
   * requestId is generated from the Erxes transaction ID so that
   * the request can later be checked through:
   * GET /merchant/loan/checkRequest/{requestId}
   */
  async createInvoice(invoice: ITransactionDocument) {
    const details = invoice.details || {};

    try {
      if (!details.phone) {
        return {
          error: 'Mobile number is required',
        };
      }

      if (!invoice.amount || invoice.amount <= 0) {
        return {
          error: 'Amount is required',
        };
      }

      const requestId = String(invoice._id);

      const data = {
        storeId: Number(this.store_id),
        mobileNumber: Number(details.phone),
        description: invoice.description || 'transaction',
        amount: invoice.amount,
        callbackUrl: this.domain
          ? `${this.domain}/pl:payment/callback/${PAYMENTS.storepay.kind}`
          : undefined,
        requestId,
      };

      const response = await this.request({
        method: 'POST',
        path: 'merchant/loan',
        data,
        headers: await this.getHeaders(),
      });

      const res: IStorePayResponse = await response.json();

      if (
        !response.ok ||
        String(res.status || '').toLowerCase() !== 'success'
      ) {
        return {
          error: this.getStorePayError(res),
        };
      }

      return {
        ...res,
        requestId,
        text: `Invoice has been sent to ${details.phone}`,
      };
    } catch (error) {
      return {
        error: getErrorMessage(error),
      };
    }
  }

  /**
   * Check invoice confirmation status by Storepay invoice number.
   *
   * GET /merchant/loan/check/{loanId}
   */
  async checkInvoice(invoiceNumber: string) {
    try {
      const response = await this.request({
        method: 'GET',
        path: `merchant/loan/check/${encodeURIComponent(invoiceNumber)}`,
        headers: await this.getHeaders(),
      });

      const res: IStorePayResponse = await response.json();

      if (
        String(res.status || '').toLowerCase() !== 'success' ||
        res.value !== true
      ) {
        return PAYMENT_STATUS.PENDING;
      }

      return PAYMENT_STATUS.PAID;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Check invoice creation/confirmation by requestId.
   *
   * GET /merchant/loan/checkRequest/{requestId}
   *
   * Response contains:
   * - isExist
   * - isConfirmed
   * - loanId
   * - depositAmount
   */
  async checkRequest(requestId: string) {
    try {
      const response = await this.request({
        method: 'GET',
        path: `merchant/loan/checkRequest/${encodeURIComponent(requestId)}`,
        headers: await this.getHeaders(),
      });

      const res: IStorePayResponse = await response.json();

      if (String(res.status || '').toLowerCase() !== 'success') {
        return {
          status: PAYMENT_STATUS.PENDING,
          isExist: false,
          isConfirmed: false,
          loanId: null,
          depositAmount: null,
          error: this.getStorePayError(res),
        };
      }

      return {
        status:
          res.isConfirmed === true
            ? PAYMENT_STATUS.PAID
            : PAYMENT_STATUS.PENDING,
        isExist: res.isExist === true,
        isConfirmed: res.isConfirmed === true,
        loanId: res.loanId,
        depositAmount: res.depositAmount,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Manual invoice status check.
   */
  async manualCheck(invoice: ITransactionDocument) {
    const invoiceNumber = invoice.response?.value;

    if (!invoiceNumber) {
      return PAYMENT_STATUS.PENDING;
    }

    return this.checkInvoice(String(invoiceNumber));
  }

  /**
   * Cancel an invoice.
   *
   * POST /merchant/account/cancel
   */
  async cancelInvoice(invoiceNumber: string) {
    try {
      const response = await this.request({
        method: 'POST',
        path: 'merchant/account/cancel',
        data: {
          accountId: Number(invoiceNumber),
        },
        headers: await this.getHeaders(),
      });

      const res: IStorePayResponse = await response.json();

      if (
        String(res.status || '').toLowerCase() !== 'success' ||
        res.value !== true
      ) {
        return {
          success: false,
          error: this.getStorePayError(res),
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  /**
   * Request a loan amount change or cancellation.
   *
   * changeTypeId:
   * 1 = change amount
   * 2 = cancel
   *
   * POST /merchant/loanChange
   */
  async changeLoan(
    loanId: string | number,
    changeTypeId: 1 | 2,
    reason: string,
    amount?: number
  ) {
    try {
      const data: {
        changeTypeId: number;
        loanId: number;
        reason: string;
        amount?: number;
      } = {
        changeTypeId,
        loanId: Number(loanId),
        reason,
      };

      if (changeTypeId === 1) {
        if (!amount || amount <= 0) {
          throw new Error(
            'Amount is required when changing the loan amount'
          );
        }

        data.amount = amount;
      }

      const response = await this.request({
        method: 'POST',
        path: 'merchant/loanChange',
        data,
        headers: await this.getHeaders(),
      });

      const res: IStorePayResponse = await response.json();

      if (
        !response.ok ||
        String(res.status || '').toLowerCase() !== 'success'
      ) {
        return {
          success: false,
          error: this.getStorePayError(res),
        };
      }

      return {
        success: true,
        ...res,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  private getBaseUrl() {
    return this.apiUrl.endsWith('/')
      ? this.apiUrl
      : `${this.apiUrl}/`;
  }

  private getStorePayError(res: IStorePayResponse) {
    if (res.error_description) {
      return res.error_description;
    }

    if (res.error) {
      return res.error;
    }

    if (res.msgList?.length) {
      return (
        res.msgList[0].message ||
        res.msgList[0].code ||
        'Storepay request failed'
      );
    }

    return 'Storepay request failed';
  }
}