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
  async request(args: {
    method: string;
    path: string;
    params?: any;
    data?: any;
  }) {
    const { method, path, data } = args;
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
        `${this.config.url}/${path}`,
        requestOptions
      )
    } catch (e) {
      const errorMessage = JSON.parse(e.message).message || e.message;
      throw new Error(errorMessage);
    }
  }
}
