// import { sendRequest } from '@erxes/api-utils/src/requests';
import redis from '../redis';
import * as requestify from 'requestify';
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
      const r = await requestify.request(`${this.apiUrl}/mobile/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          username: process.env.ORCHARD_USERNAME,
          password: process.env.ORCHARD_PASSWORD
        }
      });

      const responseBody = r.getBody();

      const { access_token, expires_in } = responseBody;

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
      const res = await requestify.request(url, {
        headers,
        params: options.query,
        ...options
      });

      const responseBody = res.getBody();

      return responseBody;
    } catch (e) {
      if (e.code === 401) {
        await redis.del('dac_token');
        return this.sendRequestToDac(options);
      }

      if (e.code === 400) {
        return JSON.parse(e.body);
      }

      return JSON.parse(e.body);
    }
  }
}
