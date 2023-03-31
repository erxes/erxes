import { sendRequest } from '@erxes/api-utils/src/requests';

export class BaseAPI {
  public apiUrl: string;
  private config: any;

  constructor(config) {
    this.config = config;

    this.apiUrl = config.apiUrl;
  }

  async request(args: {
    method: string;
    path: string;
    params?: any;
    data?: any;
    headers?: any;
  }) {
    const { method, path, params, data, headers } = args;

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
      throw new Error(e.message);
    }
  }
}
