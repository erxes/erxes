import fetch from 'node-fetch';
import { sendCoreMessage } from './messageBroker';

export const configDescriptions = {
  qpayMerchantUser: 'Merchant username for API',
  qpayMerchantPassword: 'Merchant password for API',
  qpayInvoiceCode: 'Invoice code for Merchant',
  qpayUrl: 'Qpay url for API',
  callbackUrl: 'The callback url for Merchant'
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getQpayConfigs = async (code, models, _params) => {
  const addresses = await models.Configs.findOne({ code });
  const value = addresses && addresses.value ? addresses.value : [];
  const actives = value.filter(i => {
    return i.status === 'active';
  });

  return actives;
};

export const getDataFromConfigById = async (code, ids: [string], config) => {
  const subConf = config[code];
  const values = subConf.value;

  return values.filter(i => {
    return ids.includes(i._id);
  });
};

export const makeInvoiceNo = length => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const fetchUrl = async (url, requestOptions) => {
  let returnData;

  await fetch(`${url}`, requestOptions)
    .then(response => response.text())
    .then(result => {
      try {
        returnData = JSON.parse(result);
      } catch (error) {
        returnData = { error: result };
      }
    })
    .catch(error => console.log('error', error));

  return returnData;
};

export const qpayToken = async config => {
  const { qpayUrl, qpayMerchantUser, qpayMerchantPassword } = config;

  const port = '/v2/auth/token';

  const raw = '';

  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${qpayMerchantUser}:${qpayMerchantPassword}`).toString(
          'base64'
        )
    },
    body: raw,
    redirect: 'follow'
  };

  const tokenInfo = await fetchUrl(`${qpayUrl}${port}`, requestOptions);
  return tokenInfo.access_token;
};

export const createInvoice = async (varData, token, config) => {
  const { qpayUrl } = config;
  const port = '/v2/invoice';
  const raw = JSON.stringify(varData);
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${qpayUrl}${port}`, requestOptions);
};

export const deleteInvoice = async (invoiceId, token, config) => {
  const { qpayUrl } = config;
  const port = `/v2/invoice/${invoiceId}`;
  const requestOptions = {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
    redirect: 'follow'
  };

  return fetchUrl(`${qpayUrl}${port}`, requestOptions);
};

export const getQpayInvoice = async (invoiceId, token, config) => {
  const { qpayUrl } = config;
  const port = `/v2/invoice/${invoiceId}`;

  const requestOptions = {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token },
    redirect: 'follow'
  };

  return fetchUrl(`${qpayUrl}${port}`, requestOptions);
};

export const checkQpayPayment = async (varData, token, config) => {
  const { qpayUrl } = config;
  const port = `/v2/payment/check`;
  const raw = JSON.stringify(varData);

  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${qpayUrl}${port}`, requestOptions);
};

export const listQpayPayment = async (varData, token, config) => {
  const { qpayUrl } = config;
  const port = `/v2/payment/list`;
  const raw = JSON.stringify(varData);

  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${qpayUrl}${port}`, requestOptions);
};

export const deleteQpayPayment = async (
  paymentId,
  description,
  token,
  config
) => {
  const { qpayUrl } = config;
  const port = `/v2/payment/cancel/${paymentId}`;
  const raw = JSON.stringify({
    callback_url: `https://qpay.mn/payment/result?payment_id=${paymentId}`,
    note: description
  });

  const requestOptions = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${qpayUrl}${port}`, requestOptions);
};

export const getQpayNuat = async (varData, token, config) => {
  const { qpayUrl } = config;
  const port = `/ebarimt/create`;
  const raw = JSON.stringify(varData);

  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: raw,
    redirect: 'follow'
  };

  return fetchUrl(`${qpayUrl}${port}`, requestOptions);
};
