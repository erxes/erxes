import fetch, { Response } from 'node-fetch';
import type { RequestInit, HeadersInit } from 'node-fetch';

import { meta } from './api';
import { redis } from 'erxes-api-shared/utils';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface RequestOptions {
  method: string;
  path: string;
  params?: Record<string, string>;
  data?: Record<string, any>;
  headers?: Record<string, string>;
}

interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
}

export class VendorBaseAPI {
  public apiUrl: string;
  private username: string;
  private password: string;
  private accessToken: string;

  constructor(config: { isFlat?: boolean }) {
    let username = process.env.QUICK_QR_USERNAME || '';
    let password = process.env.QUICK_QR_PASSWORD || '';

    if (config.isFlat) {
      username = process.env.FLAT_QUICK_QR_USERNAME || '';
      password = process.env.FLAT_QUICK_QR_PASSWORD || '';
    }

    this.username = username;
    this.password = password;
    this.apiUrl = meta.apiUrl + '/' + meta.apiVersion;
    this.accessToken = '';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      const error = data as ErrorResponse;
      throw new Error(error.message || error.error || 'Unknown error occurred');
    }

    return data as T;
  }

  async authenticate(): Promise<string> {
    try {
      const response = await fetch(this.apiUrl + '/' + meta.paths.auth, {
        method: 'POST',
        body: JSON.stringify({ terminal_id: '95000059' }),
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${this.username}:${this.password}`).toString('base64'),
          'Content-Type': 'application/json',
        },
      });

      const authData = await this.handleResponse<AuthResponse>(response);
      const { access_token, refresh_token, expires_in } = authData;

      this.accessToken = access_token;

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

      return access_token;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async refreshToken(): Promise<string> {
    const cachedData = await redis.get('qpay_merchant_data');

    if (!cachedData) {
      return await this.authenticate();
    }

    const { refresh_token: token } = JSON.parse(cachedData);

    try {
      const response = await fetch(this.apiUrl + '/' + meta.paths.refresh, {
        method: 'POST',
        body: JSON.stringify({ terminal_id: '95000059' }),
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      const authData = await this.handleResponse<AuthResponse>(response);
      const { access_token, refresh_token, expires_in } = authData;

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
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async makeRequest<T>(args: RequestOptions): Promise<T> {
    const { method, path, params, data } = args;

    try {
      const token = await this.authenticate();

      const headers: HeadersInit = {
        ...args.headers,
        Authorization: 'Bearer ' + token,
      };

      const requestOptions: RequestInit = {
        method,
        headers,
      };

      if (data) {
        requestOptions.body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
      }

      const url = new URL(`${this.apiUrl}/${path}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), requestOptions);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        await this.refreshToken();
        return await this.makeRequest(args);
      }

      throw new Error(`Request failed: ${error.message}`);
    }
  }
}
