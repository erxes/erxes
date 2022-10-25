import { PAYMENT_STATUS, PAYMENT_KINDS } from '../../constants';
import { IPaymentDocument } from '../../models/definitions/payments';
import { sendRequest } from '@erxes/api-utils/src';

import { QPAY_ACTIONS, QPAY_ENDPOINT } from '../../constants';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import { IQpayInvoice } from '../types';
import { IModels } from '../../connectionResolver';

export const qPayHandler = async (models: IModels, queryParams) => {
  const { identifier } = queryParams;

  if (!identifier) {
    throw new Error('Invoice id is required');
  }

  const invoice = await models.Invoices.getInvoice({
    identifier
  });

  const payment = await models.Payments.getPayment(invoice.selectedPaymentId);

  if (payment.kind !== 'qpay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const response = await getInvoice(invoice.apiResponse.invoice_id, payment);

    if (response.invoice_status === 'CLOSED') {
      await models.Invoices.updateOne(
        { _id: invoice._id },
        {
          $set: {
            status: PAYMENT_STATUS.PAID,
            resolvedAt: new Date(),
            description: response.invoice_description
          }
        }
      );
    }
  } catch (e) {
    throw new Error(e.message);
  }
  return invoice;
};

export const getToken = async config => {
  const { qpayMerchantUser, qpayMerchantPassword } = config;

  const requestOptions = {
    url: `${QPAY_ENDPOINT}${QPAY_ACTIONS.GET_TOKEN}`,
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${qpayMerchantUser}:${qpayMerchantPassword}`).toString(
          'base64'
        )
    },
    body: {}
  };

  try {
    const res = await sendRequest(requestOptions);

    return res.access_token;
  } catch (e) {
    throw new Error(e.message);
  }
};

export const createInvoice = async (
  invoice: IInvoiceDocument,
  payment: IPaymentDocument
) => {
  const MAIN_API_DOMAIN =
    process.env.MAIN_API_DOMAIN || 'http://localhost:4000';

  try {
    const token = await getToken(payment.config);

    const data: IQpayInvoice = {
      invoice_code: payment.config.qpayInvoiceCode,
      sender_invoice_no: invoice._id,
      invoice_receiver_code: 'terminal',
      invoice_description: invoice.description || 'test invoice',
      amount: invoice.amount,
      callback_url: `${MAIN_API_DOMAIN}/pl:payment/callback/${PAYMENT_KINDS.QPAY}?identifier=${invoice.identifier}`
    };

    const requestOptions = {
      url: `${QPAY_ENDPOINT}${QPAY_ACTIONS.INVOICE}`,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: data
    };

    try {
      return sendRequest(requestOptions);
    } catch (e) {
      throw new Error(e.message);
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

export const getInvoice = async (
  invoiceId: string,
  payment: IPaymentDocument
) => {
  try {
    const token = await getToken(payment.config);
    const requestOptions = {
      url: `${QPAY_ENDPOINT}${QPAY_ACTIONS.INVOICE}/${invoiceId}`,
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
      redirect: 'follow'
    };

    try {
      return sendRequest(requestOptions);
    } catch (e) {
      throw new Error(e.message);
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

export const cancelInvoice = async (
  invoiceId: string,
  payment: IPaymentDocument
) => {
  const token = await getToken(payment.config);
  const requestOptions = {
    url: `${QPAY_ENDPOINT}${QPAY_ACTIONS.INVOICE}/${invoiceId}`,
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
    redirect: 'follow'
  };

  return sendRequest(requestOptions);
};
