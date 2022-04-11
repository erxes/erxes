import { fetchUrl } from './utils';
import * as crypto from 'crypto';

export const configDescriptions = {
  inStoreSPKey: 'InStore SocialPay key for checksum',
  inStoreSPTerminal: 'InStore SocialPay terminal code for checksum',
  inStoreSPUrl: 'InStore SocialPay url for API',
  pushNotification: 'Push notification for catch the payemnt of customer'
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
