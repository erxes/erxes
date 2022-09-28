import { sendRequest } from '@erxes/api-utils/src';

import { QPAY_ACTIONS, QPAY_ENDPOINT } from '../../../constants';
import { IModels } from '../../connectionResolver';

export const qPayHandler = async (models: IModels, queryParams) => {
  const { payment_id, qpay_payment_id } = queryParams;

  if (!payment_id || !qpay_payment_id) {
    throw new Error('payment_id or qpay_payment_id is required');
  }

  const invoice = await models.QpayInvoices.findOne({
    _id: payment_id
  }).lean();

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  await models.QpayInvoices.updateOne(
    { _id: payment_id },
    {
      $set: {
        paymentDate: new Date(),
        qpayPaymentId: qpay_payment_id,
        status: 'paid'
      }
    }
  );

  return invoice;
};

export const qpayToken = async config => {
  const { qpayMerchantUser, qpayMerchantPassword } = config;

  const requestOptions = {
    url: `${QPAY_ENDPOINT}${QPAY_ACTIONS.TOKEN}`,
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

export const createQpayInvoice = async (data, token: string) => {
  const requestOptions = {
    url: `${QPAY_ENDPOINT}${QPAY_ACTIONS.INVOICE}`,
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) as any
  };

  try {
    return sendRequest(requestOptions);
  } catch (e) {
    throw new Error(e.message);
  }
};

export const getQpayInvoice = async (invoiceId: string, token: string) => {
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
};
