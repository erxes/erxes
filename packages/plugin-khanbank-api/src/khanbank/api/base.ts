import { sendRequest } from '@erxes/api-utils/src/requests';
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
    return 'https://api.khanbank.com/v1';
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
      const requestOptions = {
        url: `${this.apiUrl}/${path}`,
        params,
        method,
        headers,
        body: data
      };

      return await sendRequest(requestOptions);
    } catch (e) {
      const errorMessage = JSON.parse(e.message).message || e.message;
      throw new Error(errorMessage);
    }
  }
}
