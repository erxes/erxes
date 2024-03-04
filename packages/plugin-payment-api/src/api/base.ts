import fetch from 'node-fetch';
import type { RequestInit, HeadersInit } from 'node-fetch';
export class BaseAPI {
  public apiUrl: string;

  constructor(config) {
    this.apiUrl = config.apiUrl;
  }

  async request(args: {
    method: string;
    path: string;
    params?: any;
    data?: any;
    headers?: any;
  }) {
    const { method, path, params, data, headers = {} } = args;

    try {
      const requestOptions: RequestInit & Required<{ headers: HeadersInit }> = {
        method,
        headers,
      };

      if (data) {
        requestOptions.body = JSON.stringify(data);
        requestOptions.headers['Content-Type'] = 'application/json';
      }

      let url = `${this.apiUrl}/${path}`;

      if (params) {
        url += '?' + new URLSearchParams(params);
      }

      const res = await fetch(url, requestOptions);

      return res;
    } catch (e) {
      console.error('error ', e);
      throw new Error(e.message);
    }
  }
}
