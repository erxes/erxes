import * as requestify from 'requestify';
import { debugBase, debugExternalRequests } from './debuggers';

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
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  const reqBody = JSON.stringify(body || {});
  const reqParams = JSON.stringify(params || {});

  try {
    debugExternalRequests(`
      Sending request
      url: ${url}
      method: ${method}
      body: ${reqBody}
      params: ${reqParams}
    `);

    const response = await requestify.request(url, {
      method,
      headers: { 'Content-Type': 'application/json', origin: DOMAIN },
      body,
      params,
    });

    const responseBody = response.getBody();

    debugExternalRequests(`
      Success from ${url}
      requestBody: ${reqBody}
      requestParams: ${reqParams}
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
  const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });

  return sendRequest({ url: `${MAIN_API_DOMAIN}${path}`, method, body, params });
};

export const getEnv = ({ name, defaultValue }: { name: string; defaultValue?: string }): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};
