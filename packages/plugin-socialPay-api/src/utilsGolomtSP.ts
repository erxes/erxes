import * as crypto from 'crypto';
import fetch from 'node-fetch';
import { sendCoreMessage } from './messageBroker';

export const configDescriptions = {
  inStoreSPKey: 'InStore SocialPay key for checksum',
  inStoreSPTerminal: 'InStore SocialPay terminal code for checksum',
  inStoreSPUrl: 'InStore SocialPay url for API',
  pushNotification: 'Push notification for catch the payemnt of customer'
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

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
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

export const socialPayInvoiceCancel = async (raw, config) => {
  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawData,
    redirect: 'follow'
  };
  const { inStoreSPUrl } = config;
  const port = '/pos/invoice/cancel';

  return await fetchUrl(`${inStoreSPUrl}${port}`, requestOptions);
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

export const socialPayPaymentCancel = async (raw, config) => {
  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawData,
    redirect: 'follow'
  };
  const { inStoreSPUrl } = config;
  const port = '/pos/payment/cancel';

  return await fetchUrl(`${inStoreSPUrl}${port}`, requestOptions);
};
