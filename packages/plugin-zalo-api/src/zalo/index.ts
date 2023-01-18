import axios, { AxiosRequestConfig } from 'axios';
import { IModels } from '../models';
import { createOrUpdateAccount } from '../server/controllers';
const querystring = require('querystring');
import { debug } from '../configs';
import { getConfig } from '../server';
import { extend } from 'lodash';

const OAAPIUrl = 'https://openapi.zalo.me/v2.0/oa/';
const OAAuthAPIUrl = 'https://oauth.zaloapp.com/v4/oa/access_token';

export let Zalo;
export let ZaloAuth;
export let ZaloAppID: string = '';
export let ZaloSecretKey: string = '';
export let ZaloAccessToken: string = '';
export let ZaloRefreshToken: string = '';

export const createAPI = (baseURL: string, options: Object = {}) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });
};

export const getAPI = () => {
  if (!Zalo)
    Zalo = createAPI('https://openapi.zalo.me/v2.0/oa/', {
      headers: {
        'Content-Type': 'application/json',
        access_token: ZaloAccessToken
      }
    });
  Zalo.defaults.headers.common['access_token'] = ZaloAccessToken;
  return Zalo;
};

export const getAuthAPI = () => {
  if (!ZaloAuth)
    ZaloAuth = createAPI('https://oauth.zaloapp.com/v4/oa/', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: ZaloSecretKey
      }
    });
  ZaloAuth.defaults.headers.common['secret_key'] = ZaloSecretKey;
  return ZaloAuth;
};

export const setAccessToken = (token: string) => {
  ZaloAccessToken = token;
};

export const setRefreshToken = (token: string) => {
  ZaloRefreshToken = token;
};

export const setZaloConfigs = (
  app_id: string = '',
  secret_key: string = ''
) => {
  ZaloAppID = app_id;
  ZaloSecretKey = secret_key;
};

export const getAccessTokenByOauthCode = async (
  code: string,
  app_id: string,
  secret_key: string,
  callback: Function = () => {}
) => {
  return await axios
    .post(
      OAAuthAPIUrl,
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        app_id
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key
        }
      }
    )
    .then((res: any) => res.data)
    .then((res: any) => {
      debug.error(`getAccessTokenByOauthCode ${res}`);
      callback(res);
      return res;
    })
    .catch((e: any) => {
      return e;
    });
};

export const getAccessToken = async (models, refresh_token: string) => {
  const ZALO_APP_ID = await getConfig(models, 'ZALO_APP_ID');
  const ZALO_APP_SECRET_KEY = await getConfig(models, 'ZALO_APP_SECRET_KEY');

  return await axios
    .post(
      OAAuthAPIUrl,
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
        app_id: ZALO_APP_ID
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: ZALO_APP_SECRET_KEY
        }
      }
    )
    .then((res: any) => res.data)
    .catch((e: any) => {
      return e;
    });
};

export interface ZaloRequestConfig extends AxiosRequestConfig {
  models?: any;
  oa_id?: string;
  access_token?: string;
}

export const zaloGetAccessToken = async (models, oa_id: string = '') => {
  // const account = await models.Accounts.findOne({ oa_id });

  let access_token = '';

  const account = await models.Accounts.findOne({
    oa_id
  });

  // debug.error(`zaloGet: ${account}`)

  // debug.error(`condition: ${account?.access_token && account?.access_token_expires_in > new Date().getTime()}`)
  // debug.error(`account?.access_token: ${account?.access_token}`)
  // debug.error(`account?.access_token_expires_in: ${account?.access_token_expires_in}`)
  // debug.error(`new Date().getTime(): ${new Date().getTime()}`)

  if (
    account?.access_token &&
    account?.access_token_expires_in > new Date().getTime()
  ) {
    return account?.access_token;
  }

  if (account?.refresh_token) {
    const token = await getAccessToken(models, account?.refresh_token);
    // debug.error(`token: ${JSON.stringify(token)}`)
    access_token = token?.access_token;
    if (token?.access_token)
      await createOrUpdateAccount(models.Accounts, {
        oa_id,
        access_token,
        refresh_token: token?.refresh_token
      });
    return access_token;
  }
};

export const getRequestConfigs = (config, access_token) => {
  delete config?.models;
  delete config?.oa_id;
  delete config?.access_token;

  let output = {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
      access_token
    }
  };

  return output;
};

export const zaloGet = async (
  path: string = '',
  config?: ZaloRequestConfig
) => {
  const access_token =
    config?.access_token ||
    (await zaloGetAccessToken(config?.models, config?.oa_id));
  return await axios
    .get(`${OAAPIUrl}${path}`, getRequestConfigs(config, access_token))
    .then((res: any) => res.data)
    .catch((e: any) => e);
};

export const zaloSend = async (
  path: string = '',
  data?: any,
  config?: ZaloRequestConfig
) => {
  const access_token =
    config?.access_token ||
    (await zaloGetAccessToken(config?.models, config?.oa_id));

  return await axios
    .post(`${OAAPIUrl}${path}`, data, getRequestConfigs(config, access_token))
    .then((res: any) => res.data)
    .catch((e: any) => e);
};
