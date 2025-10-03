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
    console.debug('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });

    if (!response.ok) {
      const error = data as ErrorResponse;
      console.debug('API Error:', {
        status: response.status,
        error: error.message || error.error,
        code: error.code
      });
      throw new Error(error.message || error.error || 'Unknown error occurred');
    }

    return data as T;
  }

  async authenticate(): Promise<string> {
    try {
      console.debug('Authenticating with QuickQR API...');
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

      console.debug('Authentication successful', {
        expiresIn: expires_in,
        hasRefreshToken: !!refresh_token
      });

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
      console.debug('Authentication failed:', error.message);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async refreshToken(): Promise<string> {
    console.debug('Attempting to refresh token...');
    const cachedData = await redis.get('qpay_merchant_data');

    if (!cachedData) {
      console.debug('No cached data found, performing fresh authentication');
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

      console.debug('Token refresh successful', {
        expiresIn: expires_in,
        hasRefreshToken: !!refresh_token
      });

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
      console.debug('Token refresh failed:', error.message);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async makeRequest<T>(args: RequestOptions): Promise<T> {
    const { method, path, params, data } = args;

    try {
      console.debug('Making API request:', {
        method,
        path,
        params,
        hasData: !!data
      });

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

      console.debug('Request URL:', url.toString());

      const response = await fetch(url.toString(), requestOptions);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.debug('Request failed:', {
        error: error.message,
        path,
        method
      });

      if (error.message.includes('Unauthorized')) {
        console.debug('Unauthorized error, attempting token refresh');
        await this.refreshToken();
        return await this.makeRequest(args);
      }

      throw new Error(`Request failed: ${error.message}`);
    }
  }
}
