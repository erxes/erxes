import { sendRequest } from '@erxes/api-utils/src/requests';
import { IQPayConfig } from '../../models/definitions/configs';

export const fetchQPayToken = async (qpayConfig: IQPayConfig) => {
  const response = await sendRequest({
    url: `${qpayConfig.url}/v2/auth/token`,
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${qpayConfig.username}:${qpayConfig.password}`
      ).toString('base64')}`
    }
  });

  return response;
};

export const requestQPayInvoice = async (
  data: any,
  accessToken: string,
  qpayConfig: IQPayConfig
) => {
  console.log(data, 'dataaaaaaaaaa');
  const response = await sendRequest({
    method: 'POST',
    url: `${qpayConfig.url}/v2/invoice`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: { ...data }
  });

  return response;
};

export const fetchQPayInvoice = async (
  invoiceId: string,
  accessToken: string,
  config: IQPayConfig
) => {
  const response = await sendRequest({
    method: 'GET',
    url: `${config.url}/v2/invoice/${invoiceId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response;
};

export const requestInvoiceDeletion = async (
  invoiceId: string,
  accessToken: string,
  config: IQPayConfig
) => {
  const response = await sendRequest({
    method: 'DELETE',
    url: `${config.url}/v2/invoice/${invoiceId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response;
};

export const fetchInvoicePayment = async (
  invoiceId: string,
  accessToken: string,
  config: IQPayConfig
) => {
  const response = await sendRequest({
    method: 'POST',
    url: `${config.url}/v2/payment/check`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: {
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100
      }
    }
  });

  return response;
};
