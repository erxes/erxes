import fetch from 'node-fetch';
import type { RequestInit, HeadersInit } from 'node-fetch';

export class BaseApi {
  protected config: {
    apiUrl: string;
    username: string;
    password: string;
  };

  constructor(config: { apiUrl: string; username: string; password: string }) {
    this.config = config;
  }

  protected getBasicAuthHeaders(): HeadersInit {
    const auth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    };
  }

  protected async request(args: {
    method: string;
    path?: string;
    params?: Record<string, string>;
    data?: any;
    useBasicAuth?: boolean;
  }): Promise<any> {
    const { method, path = '', params, data, useBasicAuth = true } = args;

    let url = this.config.apiUrl;
    if (path) {
      url = `${this.config.apiUrl}/${path}`;
    }

    if (params) {
      const searchParams = new URLSearchParams(params);
      url = `${url}?${searchParams.toString()}`;
    }

    const headers = useBasicAuth ? this.getBasicAuthHeaders() : { 'Content-Type': 'application/json' };

    const requestOptions: RequestInit & Required<{ headers: HeadersInit }> = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.errorDescription || errorJson.errorCode || errorText;
        } catch {
          // Keep original error text
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (e) {
      console.error('TDB API request failed:', e);
      throw new Error(e.message);
    }
  }
}