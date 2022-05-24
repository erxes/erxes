import { sendRequest } from './commonUtils';

export const fetchQPayToken = async qpayConfig => {
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

export const requestQPayInvoice = async (data: any, accessToken: string) => {
  const response = await sendRequest({
    method: 'POST',

    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: { ...data }
  });

  return response;
};

export const fetchQPayInvoice = async (
  invoiceId: string,
  accessToken: string
) => {
  const response = await sendRequest({
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response;
};

export const requestInvoiceDeletion = async (
  invoiceId: string,
  accessToken: string
) => {
  const response = await sendRequest({
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response;
};

export const fetchInvoicePayment = async (
  invoiceId: string,
  accessToken: string
) => {
  const response = await sendRequest({
    method: 'POST',
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
