import * as requestify from 'requestify';

interface IRequestParams {
  url?: string;
  path?: string;
  method: string;
  params?: { [key: string]: string };
  body?: { [key: string]: string };
}

/**
 * Send request to main api
 */
export const fetchMainApi = async ({ path, method, body, params }: IRequestParams) => {
  const { MAIN_API_DOMAIN } = process.env;

  const response = await requestify.request(`${MAIN_API_DOMAIN}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
    params,
  });

  return response.getBody();
};
