import * as debug from 'debug';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as dns from 'dns';
import redis from './redis';
import * as tmp from 'tmp';

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
  errorMessage?: string,
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
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    } as any;

    if (method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Request failed with status ${response.status}. Response body: ${errorBody}`,
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
  defaultValue,
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

export const isValidDomain = async (email) => {
  const domain = email.split('@')[1];

  const cachedDomainResponse = await redis.get(`verifier:${domain}`);

  if (!cachedDomainResponse) {
    return new Promise((resolve) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err) {
          resolve(false);
        } else {
          if (addresses.length > 0) {
            redis.set(`verifier:${domain}`, 'valid', 'EX', 24 * 60 * 60);
          }

          resolve(true);
        }
      });
    });
  }

  return cachedDomainResponse === 'valid' ? true : false;
};

export const isValidEmail = (email) => {
  const complexEmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  return complexEmailRegex.test(email);
};

export const sendFile = async (
  url: string,
  token: string,
  fileName: string,
  hostname: string,
  key: string,
) => {
  const form = new FormData();

  const fileStream = fs.createReadStream(fileName);

  form.append('file', fileStream);

  try {
    const result: any = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer:${token}`,
      },
      body: form,
    }).then((r) => r.json());

    const { data, error } = result;

    if (data) {
      const listIds = await getArray(key);

      listIds.push({ listId: data.list_id, hostname });

      setArray(key, listIds);

      tmp.setGracefulCleanup();
      await fs.unlinkSync(fileName);
    } else if (error) {
      throw new Error(error.message);
    }
  } catch (e) {
    throw e;
  }
};

export const setArray = async (key, array) => {
  const jsonArray = JSON.stringify(array);
  await redis.set(key, jsonArray);
};

export const getArray = async (key) => {
  const jsonArray = await redis.get(key);

  if (!jsonArray) {
    return [];
  }

  return JSON.parse(jsonArray);
};
