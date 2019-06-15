import * as requestify from 'requestify';
import { debugExternalRequests } from './debuggers';

interface IRequestParams {
  url?: string;
  path?: string;
  method: string;
  params?: { [key: string]: string };
  body?: { [key: string]: string };
}

/**
 * Send request
 */
export const sendRequest = async ({ url, method, body, params }: IRequestParams) => {
  try {
    debugExternalRequests(`
      Sending request
      url: ${url}
      method: ${method}
      body: ${JSON.stringify(body || {})}
      params: ${JSON.stringify(params || {})}
    `);

    const response = await requestify.request(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
      params,
    });

    const responseBody = response.getBody();

    debugExternalRequests(`
      Success from ${url}
      responseBody: ${JSON.stringify(responseBody)}
    `);

    return responseBody;
  } catch (e) {
    if (e.code === 'ECONNREFUSED') {
      debugExternalRequests(`Failed to connect ${url}`);
      throw new Error(`Failed to connect ${url}`);
    } else {
      debugExternalRequests(`Error occurred in ${url}: ${e.body}`);
      throw new Error(e.body);
    }
  }
};

/**
 * Send request to main api
 */
export const fetchMainApi = async ({ path, method, body, params }: IRequestParams) => {
  const { MAIN_API_DOMAIN } = process.env;

  return sendRequest({ url: `${MAIN_API_DOMAIN}${path}`, method, body, params });
};
