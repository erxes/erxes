import { getAuthHeaders } from '../utils';
import fetch from 'node-fetch';
import type { RequestInit, HeadersInit } from 'node-fetch';

export class BaseApi {
  private config: any;

  constructor(config) {
    this.config = config;
  }

  async getHeaders() {
    return await getAuthHeaders(this.config);
  }

  get apiUrl() {
    return 'https://api.khanbank.com/v1';
  }

  async request(args: {
    method: string;
    path: string;
    params?: any;
    data?: any;
  }) {
    const { method, path, params, data } = args;
    const headers = (await this.getHeaders()) || {};

    try {
      const requestOptions: RequestInit & Required<{ headers: HeadersInit }> = {
        method,
        headers,
      };

      if (data) {
        requestOptions.body = JSON.stringify(data);
        requestOptions.headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(
        `${this.apiUrl}/${path}?` + new URLSearchParams(params),
        requestOptions,
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return await res.json();
    } catch (e) {
      const errorMessage = JSON.parse(e.message).message || e.message;
      throw new Error(errorMessage);
    }
  }
}
