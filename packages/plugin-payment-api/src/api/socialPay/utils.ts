import { sendRequest } from '@erxes/api-utils/src';
import * as crypto from 'crypto';

import { SOCIALPAY_ACTIONS, SOCIALPAY_ENDPOINT } from '../../../constants';
import { IModels } from '../../connectionResolver';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import { IPaymentConfigDocument } from '../../models/definitions/paymentConfigs';
import { ISocialPayInvoice } from '../types';

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

    const invoiceObj = await models.Invoices.getInvoice({
      _id: invoice._id
    });

    await models.Invoices.updateOne(
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

export const createInvoice = async (
  invoice: IInvoiceDocument,
  paymentConfig: IPaymentConfigDocument
) => {
  const { inStoreSPTerminal, inStoreSPKey } = paymentConfig.config;

  const amount = invoice.amount.toString();
  let url = `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_QR}`;

  const data: ISocialPayInvoice = {
    amount,
    checksum: hmac256(inStoreSPKey, inStoreSPTerminal + invoice._id + amount),
    invoice: invoice._id,
    terminal: inStoreSPTerminal
  };

  if (invoice.phone) {
    data.phone = invoice.phone;
    url = `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_PHONE}`;
    data.checksum = hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoice._id + amount + invoice.phone
    );
  }

  const requestOptions = {
    url,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
    redirect: 'follow'
  };

  try {
    const { header, body } = await sendRequest(requestOptions);

    if (header.code !== 200) {
      throw new Error(body.response.desc);
    }

    if (body.response.desc.includes('socialpay-payment')) {
      return { text: body.response.desc };
    } else {
      return { text: 'Нэхэмжлэхийг SocialPay-руу илгээлээ.' };
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

export const cancelInvoice = async (
  invoice: IInvoiceDocument,
  paymentConfig: IPaymentConfigDocument
) => {
  const { inStoreSPTerminal, inStoreSPKey } = paymentConfig.config;

  const amount = invoice.amount.toString();

  const data: ISocialPayInvoice = {
    amount,
    checksum: hmac256(inStoreSPKey, inStoreSPTerminal + invoice._id + amount),
    invoice: invoice._id,
    terminal: inStoreSPTerminal
  };

  const requestOptions = {
    url: `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_CANCEL}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
    redirect: 'follow'
  };

  return sendRequest(requestOptions);
};

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};
