import * as requestify from 'requestify';

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
    const response = await requestify.request(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
      params,
    });

    return response.getBody();
  } catch (e) {
    console.log(e);
  }
};

/**
 * Send request to main api
 */
export const fetchMainApi = async ({ path, method, body, params }: IRequestParams) => {
  const { MAIN_API_DOMAIN } = process.env;

  return sendRequest({ url: `${MAIN_API_DOMAIN}${path}`, method, body, params });
};
