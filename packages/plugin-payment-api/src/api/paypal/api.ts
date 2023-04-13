import { IModels } from '../../connectionResolver';
import { PAYMENTS } from '../constants';
import { BaseAPI } from '../base';
import redis from '../../redis';

export const paypalCallbackHandler = async (models: IModels, data: any) => {
  const { paymentId, PayerID } = data;

  if (!paymentId) {
    throw new Error('paymentId is required');
  }

  if (!PayerID) {
    throw new Error('PayerID is required');
  }
};

export interface IPaypalConfig {
  paypalMode: 'sandbox' | 'live';
  paypalClientId: string;
  paypalClientSecret: string;
}

export class PaypalAPI extends BaseAPI {
  private mode: string;
  private clientId: string;
  private clientSecret: any;

  constructor(config: IPaypalConfig) {
    super(config);

    this.mode = config.paypalMode;
    this.clientId = config.paypalClientId;
    this.clientSecret = config.paypalClientSecret;

    this.apiUrl =
      config.paypalMode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com/v1'
        : 'https://api-m.paypal.com/v1';
  }

  async getHeaders() {
    const { clientId, clientSecret } = this;

    const token = await redis.get(`paypal_token_${clientId}`);

    if (token) {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
    }

    try {
      const res = await this.request({
        path: PAYMENTS.paypal.actions.getToken,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'Accept-Language': 'en_US',
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString('base64')}`
        },
        data: {
          grant_type: 'client_credentials'
        }
      });

      await redis.set(
        `paypal_token_${clientId}`,
        res.access_token,
        'EX',
        res.expires_in - 60
      );

      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${res.access_token}`
      };
    } catch (e) {
      console.log('e', e);
    }
  }
}
