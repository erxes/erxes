import { sendRequest } from '@erxes/api-utils/src';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

import { IModels } from '../../connectionResolver';
import {
  PAYMENT_STATUS,
  SOCIALPAY_ACTIONS,
  SOCIALPAY_ENDPOINT
} from '../../constants';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import { IPaymentDocument } from '../../models/definitions/payments';
import { ISocialPayInvoice } from '../types';

export const socialPayHandler = async (models: IModels, data) => {
  const { resp_code, amount, checksum, invoice, terminal } = data;

  let status = PAYMENT_STATUS.PAID;

  if (resp_code !== '00') {
    status = PAYMENT_STATUS.PENDING;
  }
  try {
    const { body } = await socialPayInvoiceCheck({
      amount,
      checksum,
      invoice,
      terminal
    });

    if (body.response.resp_code !== '00') {
      status = PAYMENT_STATUS.PENDING;
      throw new Error(body.response.resp_desc);
    }

    const invoiceObj = await models.Invoices.getInvoice({
      identifier: invoice
    });

    await models.Invoices.updateOne(
      { _id: invoiceObj._id },
      { $set: { status, resolvedAt: new Date() } }
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
  payment: IPaymentDocument
) => {
  const { inStoreSPTerminal, inStoreSPKey } = payment.config;

  const amount = invoice.amount.toString();
  let url = `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_QR}`;

  const data: ISocialPayInvoice = {
    amount,
    checksum: hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoice.identifier + amount
    ),
    invoice: invoice.identifier,
    terminal: inStoreSPTerminal
  };

  if (invoice.phone) {
    data.phone = invoice.phone;
    url = `${SOCIALPAY_ENDPOINT}${SOCIALPAY_ACTIONS.INVOICE_PHONE}`;
    data.checksum = hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoice.identifier + amount + invoice.phone
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
      const qrData = await QRCode.toDataURL(body.response.desc);

      return { qrData };
    } else {
      return { text: 'Нэхэмжлэхийг SocialPay-руу илгээлээ.' };
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

export const cancelInvoice = async (
  invoice: IInvoiceDocument,
  payment: IPaymentDocument
) => {
  const { inStoreSPTerminal, inStoreSPKey } = payment.config;

  const amount = invoice.amount.toString();

  const data: ISocialPayInvoice = {
    amount,
    checksum: hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoice.identifier + amount
    ),
    invoice: invoice.identifier,
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
