import { sendRequest } from '@erxes/api-utils/src';
import * as crypto from 'crypto';

import { SOCIALPAY_ACTIONS, SOCIALPAY_ENDPOINT } from '../../../constants';
import { IModels } from '../../connectionResolver';

export const socialPayHandler = async (models: IModels, body) => {
  console.log('body', body);

  return models.PaymentConfigs.find({});
};

export const socialPayInvoiceCheck = async data => {
  const requestOptions = {
    url: `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_CHECK}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data) as any,
    redirect: 'follow'
  };

  return sendRequest(requestOptions);
};

export const socialPayInvoicePhone = async data => {
  const requestOptions = {
    url: `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_PHONE}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data) as any,
    redirect: 'follow'
  };

  return sendRequest(requestOptions);
};

export const socialPayInvoiceQR = async data => {
  const requestOptions = {
    url: `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_QR}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data) as any,
    redirect: 'follow'
  };

  return sendRequest(requestOptions);
};

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};
