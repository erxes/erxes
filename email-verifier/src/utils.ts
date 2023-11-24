import * as debug from 'debug';
import fetch from 'node-fetch';

export const debugBase = debug('erxes-email-verifier:base');
export const debugCrons = debug('erxes-email-verifier:crons');
export const debugError = debug('erxes-email-verifier:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);

interface IRequestParams {
  url?: string;
  path?: string;
  method?: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: string };
  body?: { [key: string]: any };
  form?: { [key: string]: any };
}

/**
 * Sends post request to specific url
 */
export const sendRequest = async (
  { url, method, headers, form, body, params }: IRequestParams,
  errorMessage?: string
) => {
  debugBase(`
    Sending request to
    url: ${url}
    method: ${method}
    body: ${JSON.stringify(body)}
    params: ${JSON.stringify(params)}
    headers: ${JSON.stringify(headers)}
    form: ${JSON.stringify(form)}
  `);

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) }
    } as any;

    if (method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Request failed with status ${response.status}. Response body: ${errorBody}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else if (contentType && contentType.includes('text/html')) {
      return response.text();
    } else {
      return response.text();
    }
  } catch (e) {
    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      throw new Error(errorMessage);
    } else {
      const message = e.body || e.message;
      throw new Error(message);
    }
  }
};

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  return value || '';
};
