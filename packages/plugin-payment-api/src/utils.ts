import { getSubdomain } from '@erxes/api-utils/src/core';
import * as crypto from 'crypto';
import fetch from 'node-fetch';

import { QPAY_URL } from '../constants';
import { generateModels, IModels } from './connectionResolver';

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

export const paymentCallback = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { query } = req;
  const { type } = query;

  if (!type) {
    return res.status(400).send('Type is required');
  }

  try {
    switch (type) {
      case 'qpay':
        return callBackQpay(models, query);
    }
  } catch (error) {
    return res.status(400).send(error);
  }

  return res.status(200).send('OK');
};

export const callBackSocialPay = async (req, res) => {
  const subdomain = getSubdomain(req);

  console.log('call back socialPay url ...');
  console.log(req.query);

  const models = await generateModels(subdomain);

  return res.status(200).send('OK');
};

export const callBackQpay = async (models: IModels, queryParams) => {
  console.log('call back url ...');

  const { payment_id, qpay_payment_id } = queryParams;

  console.log('payment_id, qpay_payment_id:', payment_id, qpay_payment_id);

  if (!payment_id || !qpay_payment_id) {
    throw new Error('payment_id or qpay_payment_id is required');
  }

  // const requestData = { payment_id, qpay_payment_id };

  // models.QpayInvoices.qpayInvoiceUpdate(requestData);
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

  const tokenInfo = await fetchUrl(`${QPAY_URL}${port}`, requestOptions);

  return tokenInfo.access_token;
};

export const createQpayInvoice = async (varData, token, config) => {
  const { qpayUrl } = config;
  const port = '/v2/invoice';
  // const raw = JSON.stringify(varData);

  console.log('varData: ', varData);
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: varData,
    redirect: 'follow'
  };

  return fetchUrl(`${QPAY_URL}${port}`, requestOptions);
};

export const getQpayInvoice = async (invoiceId, token, config) => {
  const { qpayUrl } = config;
  const port = `/v2/invoice/${invoiceId}`;

  const requestOptions = {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token },
    redirect: 'follow'
  };

  return fetchUrl(`${QPAY_URL}${port}`, requestOptions);
};

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};

export const socialPayInvoiceCheck = async (raw, config) => {
  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawData,
    redirect: 'follow'
  };
  const { inStoreSPUrl } = config;
  const port = '/pos/invoice/check';

  return await fetchUrl(`${inStoreSPUrl}${port}`, requestOptions);
};

export const socialPayInvoicePhone = async (raw, config) => {
  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawData,
    redirect: 'follow'
  };
  const { inStoreSPUrl } = config;
  const port = '/pos/invoice/phone';

  return await fetchUrl(`${inStoreSPUrl}${port}`, requestOptions);
};

export const socialPayInvoiceQR = async (raw, config) => {
  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawData,
    redirect: 'follow'
  };
  const { inStoreSPUrl } = config;
  const port = '/pos/invoice/qr';

  return await fetchUrl(`${inStoreSPUrl}${port}`, requestOptions);
};
