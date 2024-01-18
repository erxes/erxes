import fetch from 'node-fetch';
import type { RequestInit, HeadersInit } from 'node-fetch';
import redis from '../../redis';
import { meta } from './api';

export class VendorBaseAPI {
  public apiUrl: string;
  private username: string;
  private password: string;
  private accessToken: string;

  constructor(config) {
    this.username = process.env.QUICK_QR_USERNAME || '';
    this.password = process.env.QUICK_QR_PASSWORD || '';
    this.apiUrl = meta.apiUrl + '/' + meta.apiVersion;
    this.accessToken = '';
  }

  async authenticate() {
    try {
      const authResponse = await fetch(this.apiUrl + '/' + meta.paths.auth, {
        method: 'POST',
        body: JSON.stringify({ terminal_id: '95000059' }),
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${this.username}:${this.password}`).toString('base64'),
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());

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
      const authResponse = await fetch(this.apiUrl + '/' + meta.paths.refresh, {
        method: 'POST',
        body: JSON.stringify({ terminal_id: '95000059' }),
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());

      const { access_token, refresh_token, expires_in } = authResponse;

      const data = {
        access_token,
        refresh_token,
        tokenExpiration: expires_in * 1000 + Date.now(),
      };

      await redis.set(
        'qpay_merchant_data',
        JSON.stringify(data),
        'EX',
        expires_in,
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
      Authorization: 'Bearer ' + token,
    };

    try {
      const requestOptions: RequestInit & Required<{ headers: HeadersInit }> = {
        method,
        headers,
      };

      if (data) {
        requestOptions.body = JSON.stringify(data);
        requestOptions.headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(
        `${this.apiUrl}/${path}?` + new URLSearchParams(params),
        requestOptions,
      );

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
