import * as requestify from 'requestify';
import { sendMessage } from './messageBroker';
import { debugExternalApi } from './debuggers';
export interface IRequestParams {
  url?: string;
  path?: string;
  method?: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: string };
  body?: { [key: string]: any };
  form?: { [key: string]: string };
}

/**
 * Sends post request to specific url
 */
export const sendRequest = async (
  { url, method, headers, form, body, params }: IRequestParams,
  errorMessage?: string
) => {
  debugExternalApi(`
    Sending request to
    url: ${url}
    method: ${method}
    body: ${JSON.stringify(body)}
    params: ${JSON.stringify(params)}
  `);

  try {
    const response = await requestify.request(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      form,
      body,
      params
    });

    const responseBody = response.getBody();

    debugExternalApi(`
      Success from : ${url}
      responseBody: ${JSON.stringify(responseBody)}
    `);

    return responseBody;
  } catch (e) {
    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      throw new Error(errorMessage);
    } else {
      const message = e.body || e.message;
      throw new Error(message);
    }
  }
};

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      console.log(e.message);

      if (callback) {
        return callback(res, e, next);
      }

      return next(e);
    }
  };
};

export const sendToWebhook = async (messageBroker, { subdomain, data }) => {
  const isWebhooksAvailable = await messageBroker.sendRPCMessage(
    'gateway:isServiceAvailable',
    'webhooks'
  );

  if (isWebhooksAvailable) {
    await sendMessage(`webhooks:send`, {
      subdomain,
      data
    });
  }
};
