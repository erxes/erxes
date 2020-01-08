import * as request from 'request-promise';
import * as sanitizeHtml from 'sanitize-html';
import { debugBase, debugExternalRequests } from './debuggers';
import { IProviderSettings } from './nylas/types';

interface IRequestParams {
  url?: string;
  path?: string;
  headerType?: string;
  headerParams?: { [key: string]: string };
  method: string;
  params?: { [key: string]: string };
  body?: { [key: string]: string | string[] | boolean | IProviderSettings };
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
export const sendRequest = ({ url, headerType, headerParams, method, body, params }: IRequestParams): Promise<any> => {
  return new Promise((resolve, reject) => {
    const DOMAIN = getEnv({ name: 'DOMAIN' });

    const reqBody = JSON.stringify(body || {});
    const reqParams = JSON.stringify(params || {});

    debugExternalRequests(`
        Sending request
        url: ${url}
        method: ${method}
        body: ${reqBody}
        params: ${reqParams}
      `);

    request({
      uri: encodeURI(url),
      method,
      headers: {
        'Content-Type': headerType || 'application/json',
        ...headerParams,
        origin: DOMAIN,
      },
      ...(headerType && headerType.includes('form') ? { form: body } : { body }),
      qs: params,
      json: true,
    })
      .then(res => {
        debugExternalRequests(`
        Success from ${url}
        requestBody: ${reqBody}
        requestParams: ${reqParams}
        responseBody: ${JSON.stringify(res)}
      `);

        return resolve(res);
      })
      .catch(e => {
        if (e.code === 'ECONNREFUSED') {
          debugExternalRequests(`Failed to connect ${url}`);
          throw new Error(`Failed to connect ${url}`);
        } else {
          debugExternalRequests(`Error occurred in ${url}: ${e.body}`);
          reject(e);
        }
      });
  });
};

/**
 * Clean html and css
 * @param {String} body
 * @returns {String} striped text
 */
export const cleanHtml = (body: string) => {
  const clean = sanitizeHtml(body || '', {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

  return clean.substring(0, 65);
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

/*
 * Generate url depending on given file upload publicly or not
 */
export const generateAttachmentUrl = (urlOrName: string) => {
  const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });

  if (urlOrName.startsWith('http')) {
    return urlOrName;
  }

  return `${MAIN_API_DOMAIN}/read-file?key=${urlOrName}`;
};

export const downloadAttachment = urlOrName => {
  return new Promise(async (resolve, reject) => {
    const url = generateAttachmentUrl(urlOrName);

    const options = {
      url,
      encoding: null,
    };

    try {
      await request.get(options).then(res => {
        const buffer = Buffer.from(res, 'utf8');

        resolve(buffer.toString('base64'));
      });
    } catch (e) {
      reject(e);
    }
  });
};
