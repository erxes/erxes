import { sendRequest } from '@erxes/api-utils/src/requests';
import redis from '../redis';

export class DacApi {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.ORCHARD_API_URL || '';
  }

  async getHeaders() {
    const token = await redis.get('dac_token');

    if (token) {
      return {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      };
    }

    try {
      const { access_token, expires_in } = await sendRequest({
        method: 'POST',
        url: `${this.apiUrl}/mobile/token`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          username: process.env.ORCHARD_USERNAME,
          password: process.env.ORCHARD_PASSWORD
        }
      });

      await redis.set(
        'dac_token',
        access_token,
        'EX',
        expires_in - 60 * 60 * 24
      );

      return {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async sendRequestToDac(options: any) {
    const headers = await this.getHeaders();
    const { path } = options;
    const url = `${this.apiUrl}/mobile/api/v1/${path}`;

    try {
      const res = await sendRequest({
        url,
        headers,
        ...options
      });

      return res;
    } catch (e) {
      return JSON.parse(e.message);
    }
  }
}
