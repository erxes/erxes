import fetch from 'node-fetch';
import type { RequestInit, HeaderInit } from 'node-fetch';
import { getAuthHeaders } from '../utils';

export class BaseApi {
  private config: any;

  constructor(config) {
    this.config = config;
  }

  async getHeaders() {
    return await getAuthHeaders(this.config);
  }

  get apiUrl() {
    return 'https://staging-api.burenscore.mn';
  }

  async request(args: {
    method: string;
    path: string;
    params?: any;
    data?: any;
  }) {
    const { method, path, params, data } = args;
    const headers = await this.getHeaders();

    try {
      const requestOptions: RequestInit & Required<{ headers: HeaderInit }> = {
        method,
        headers,
      };
      if (data) {
        requestOptions.body = JSON.stringify(data);
        requestOptions.headers['Content-Type'] = 'application/json';
      }
      return await fetch(
        `${this.apiUrl}/${path}?` + new URLSearchParams(params),
        requestOptions,
      ).then((r) => r.json());
    } catch (e) {
      const errorMessage = JSON.parse(e.message).message || e.message;
      throw new Error(errorMessage);
    }
  }
}
