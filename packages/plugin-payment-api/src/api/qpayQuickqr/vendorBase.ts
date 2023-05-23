import { sendRequest } from '@erxes/api-utils/src/requests';
import redis from '../../redis';
import { meta } from './api';

export class VendorBaseAPI {
  public apiUrl: string;
  private username: string;
  private password: string;
  private accessToken: string;

  constructor() {
    this.username = process.env.QUICK_QR_USERNAME || '';
    this.password = process.env.QUICK_QR_PASSWORD || '';
    this.apiUrl = meta.apiUrl + '/' + meta.apiVersion;
    this.accessToken = '';
  }

  async authenticate() {
    try {
      const authResponse = await sendRequest({
        method: 'POST',
        url: this.apiUrl + '/' + meta.paths.auth,
        body: { terminal_id: '95000059' },
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${this.username}:${this.password}`).toString('base64')
        }
      });

      const { access_token, refresh_token, expires_in } = authResponse;

      this.accessToken = access_token;

      return access_token;

      // TODO: uncomment this code when redis is ready
      // const data = {
      //   access_token,
      //   refresh_token,
      //   tokenExpiration: expires_in * 1000 + Date.now()
      // };

      // await redis.set(
      //   'qpay_merchant_data',
      //   JSON.stringify(data),
      //   'EX',
      //   expires_in
      // );

      // this.accessToken = access_token;

      // return access_token;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async refreshToken() {
    const cachedData = await redis.get('qpay_merchant_data');

    if (!cachedData) {
      return await this.authenticate();
    }

    const { refresh_token: token } = JSON.parse(cachedData);

    try {
      const authResponse = await sendRequest({
        method: 'POST',
        path: this.apiUrl + '/' + meta.paths.refresh,
        body: { terminal_id: '95000059' },
        headers: {
          Authorization: 'Bearer ' + token
        }
      });

      const { access_token, refresh_token, expires_in } = authResponse;

      const data = {
        access_token,
        refresh_token,
        tokenExpiration: expires_in * 1000 + Date.now()
      };

      await redis.set(
        'qpay_merchant_data',
        JSON.stringify(data),
        'EX',
        expires_in
      );

      this.accessToken = access_token;

      return access_token;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async makeRequest(args: {
    method: string;
    path: string;
    params?: any;
    data?: any;
    headers?: any;
  }) {
    const { method, path, params, data } = args;

    const token = await this.authenticate();

    const headers = {
      ...args.headers,
      Authorization: 'Bearer ' + token
    };

    try {
      const requestOptions = {
        url: `${this.apiUrl}/${path}`,
        params,
        method,
        headers,
        body: data
      };

      const response = await sendRequest(requestOptions);

      return response;
    } catch (e) {
      if (e.message === 'UnauthorizedError') {
        await this.refreshToken();
        return await this.makeRequest(args);
      }

      throw new Error(e.message);
    }
  }
}
