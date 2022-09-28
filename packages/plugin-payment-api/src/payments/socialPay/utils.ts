import { sendRequest } from '@erxes/api-utils/src';
import * as crypto from 'crypto';

import { SOCIALPAY_ACTIONS, SOCIALPAY_ENDPOINT } from '../../../constants';
import { IModels } from '../../connectionResolver';

export const socialPayHandler = async (models: IModels, data) => {
  const { resp_code, resp_desc, amount, checksum, invoice, terminal } = data;

  let status = 'success';
  let description = resp_desc;

  if (resp_code !== '00') {
    status = 'failed';
  }
  try {
    const { body } = await socialPayInvoiceCheck({
      amount,
      checksum,
      invoice,
      terminal
    });

    if (body.response.resp_code !== '00') {
      status = 'failed';
      description = body.response.resp_desc;

      throw new Error(body.response.resp_desc);
    }

    const invoiceObj = await models.SocialPayInvoices.getSocialPayInvoice(
      invoice
    );

    await models.SocialPayInvoices.updateOne(
      { _id: invoiceObj._id },
      { status: 'paid' }
    );

    return invoiceObj;
  } catch (e) {
    throw new Error(e.message);
  }
};

export const socialPayInvoiceCheck = async body => {
  const requestOptions = {
    url: `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_CHECK}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    redirect: 'follow'
  };

  return sendRequest(requestOptions);
};

export const socialPayInvoicePhone = async body => {
  const requestOptions = {
    url: `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_PHONE}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    redirect: 'follow'
  };

  return sendRequest(requestOptions);
};

export const socialPayInvoiceQR = async body => {
  const requestOptions = {
    url: `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_QR}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    redirect: 'follow'
  };

  return sendRequest(requestOptions);
};

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};
