import { sendRequest } from '@erxes/api-utils/src/requests';

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
    const { method, path, params, data, headers } = args;

    try {
      const requestOptions = {
        url: `${this.apiUrl}/${path}`,
        params,
        method,
        headers,
        body: data
      };

      const res = await sendRequest(requestOptions);

      return res;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
