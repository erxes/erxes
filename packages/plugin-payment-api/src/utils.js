import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { sendQpayMessage } from './messageBroker';
import fetch from 'node-fetch';

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

export const callBackSocialPay = async (req, res) => {
  const subdomain = getSubdomain(req);

  console.log('call back socialPay url ...');
  console.log(req.query);

  const models = await generateModels(subdomain);

  return;
};

export const callBackQpay = async (req, res) => {
  const subdomain = getSubdomain(req);

  console.log('call back url ...');

  const models = await generateModels(subdomain);

  const { payment_id, qpay_payment_id } = req.query;

  console.log('payment_id, qpay_payment_id:', payment_id, qpay_payment_id);

  if (!payment_id || !qpay_payment_id) {
    return;
  }

  const requestData = { payment_id, qpay_payment_id };

  const response = await sendQpayMessage({
    subdomain,
    action: 'updateInvoice',
    data: requestData,
    isRPC: true
  });

  return response;
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

export const createQpayInvoice = async (varData, token, config) => {
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
