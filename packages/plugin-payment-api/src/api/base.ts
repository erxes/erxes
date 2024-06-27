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


      const res = await fetch(
        `${this.apiUrl}/${path}?` + new URLSearchParams(params),
        requestOptions,
      );

      return res;
    } catch (e) {
      console.error(`Error in request to ${this.apiUrl}/${path}`, e);
      // console.error('error ', e);
      throw new Error(e.message);
    }
  }
}
