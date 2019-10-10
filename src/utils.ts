import * as requestify from 'requestify';
import { debugBase, debugExternalRequests } from './debuggers';

interface IRequestParams {
  url?: string;
  dataType?: string;
  path?: string;
  method: string;
  params?: { [key: string]: string };
  body?: { [key: string]: string | string[] };
}

/**
 * Check and throw error when concurrent
 * @param {Object} e - error
 * @param {String} name - model
 * @returns throw Error
 */
export const checkConcurrentError = (e: any, name: string) => {
  throw new Error(e.message.includes('duplicate') ? `Concurrent request: nylas ${name} duplication` : e);
};

/**
 * Send request
 */
export const sendRequest = async ({ url, dataType, method, body, params }: IRequestParams) => {
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
      dataType: dataType || 'json',
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

/**
 * Compose functions
 * @param {Functions} fns
 * @returns {Promise} fns value
 */
export const compose = (...fns) => arg => fns.reduceRight((p, f) => p.then(f), Promise.resolve(arg));
