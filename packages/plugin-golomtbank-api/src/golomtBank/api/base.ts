import { getAuthHeaders } from '../../utils/utils';
import fetch from 'node-fetch';
import type { RequestInit, HeadersInit } from 'node-fetch';
import { encryptData } from '../../utils/encrypt';
import { decryptData } from '../../utils/decrypt';

export class BaseApi {
  private config: any;

  constructor(config) {
    this.config = config;
  }

  async getHeaders() {
    return await getAuthHeaders(this.config);
  }

  get apiUrl() {
    return 'https://openapi-uat.golomtbank.com/api';
  }

  async request(args: {
    method: string;
    path: string;
    type?: string;
    params?: any;
    data?: any;
  }) {
    const { method, path, params, data, type } = args;
    const headers = (await this.getHeaders()) || {};
    try {
      const requestOptions: RequestInit & Required<{ headers: HeadersInit }> = {
        method,
        headers,
      };
     
        requestOptions.headers['Content-Type'] = 'application/json';
        const checkSum = await encryptData(data,this.config.sessionKey,this.config.ivKey)
        requestOptions.headers['X-Golomt-Checksum'] = checkSum;
        requestOptions.headers['X-Golomt-Service'] = type;

      if (data) {
        requestOptions.body = JSON.stringify(data);
      }
      
        const response =  await fetch(
        `${this.apiUrl}/${path}?` + new URLSearchParams(params),
        requestOptions,
      ).then((res) => res.text());
      console.log(decryptData(response,this.config.ivKey,this.config.sessionKey))
       return decryptData(response,this.config.ivKey,this.config.sessionKey)
    } catch (e) {
      console.log('e',e)
      throw new Error(e);
    }
 
  }
}
