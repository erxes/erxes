import { fetchUrl, getConfigs } from './utils';
import * as crypto from 'crypto';
import fetch from 'node-fetch';

export const configCodes = {
  key: "inStoreSPKey",
  terminal: "inStoreSPTerminal",
  url: "inStoreSPUrl",
  push: "pushNotification"
};

export const configDescriptions = {
  inStoreSPKey: "InStore SocialPay key for checksum",
  inStoreSPTerminal: "InStore SocialPay terminal code for checksum",
  inStoreSPUrl: "InStore SocialPay url for API",
  pushNotification: "Push notification for catch the payemnt of customer"
}

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac("sha256", key).update(message);
  return hash.digest("hex");
}

export const socialPayInvoicePhone = async (raw , configs ) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/json");

  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: rawData,
    redirect: 'follow'
  };
  const host = await getConfigs(configs,configCodes['url']);
  const port = "/pos/invoice/phone";
  
  return await fetchUrl(`${host}${port}`,requestOptions);
}

export const socialPayInvoiceQR = async (raw, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/json");

  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: rawData,
    redirect: 'follow'
  };  
  const host = await getConfigs(configs,configCodes['url']);
  const port = "/pos/invoice/qr";
  
  return await fetchUrl(`${host}${port}`,requestOptions);
}

export const socialPayInvoiceCancel = async (raw, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/json");

  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: rawData,
    redirect: 'follow'
  };
  const host = await getConfigs(configs,configCodes['url']);
  const port = "/pos/invoice/cancel";
  
  return await fetchUrl(`${host}${port}`,requestOptions);
}

export const socialPayInvoiceCheck = async (raw, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/json");

  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: rawData,
    redirect: 'follow'
  };
  const host = await getConfigs(configs,configCodes['url']);
  const port = "/pos/invoice/check";
  
  return await fetchUrl(`${host}${port}`,requestOptions);

}

export const socialPayPaymentCancel = async (raw, configs) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/json");

  const rawData = JSON.stringify(raw);
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: rawData,
    redirect: 'follow'
  };  
  const host = await getConfigs(configs,configCodes['url']);
  const port = "/pos/payment/cancel";
  
  return await fetchUrl(`${host}${port}`,requestOptions);
}