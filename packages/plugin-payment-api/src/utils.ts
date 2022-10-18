import { getSubdomain } from '@erxes/api-utils/src/core';

import { qPayHandler } from './api/qPay/utils';
import * as qPayUtils from './api/qPay/utils';
import { socialPayHandler } from './api/socialPay/utils';
import * as socialPayUtils from './api/socialPay/utils';
import { graphqlPubsub } from './configs';
import { generateModels } from './connectionResolver';
import { PAYMENT_KINDS } from './constants';
import { IInvoiceDocument } from './models/definitions/invoices';
import { IPaymentDocument } from './models/definitions/payments';
import redisUtils from './redisUtils';

export const getHandler = async (req, res) => {
  const { route } = req;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { query } = req;
  let kind =
    query.kind ||
    route.path
      .split('/')
      .slice(-1)
      .pop();

  if (!kind) {
    return res.status(400).send('kind is required');
  }

  try {
    let invoice: any;
    switch (kind) {
      case PAYMENT_KINDS.QPAY:
        invoice = await qPayHandler(models, query);
    }

    if (invoice) {
      graphqlPubsub.publish('invoiceUpdated', {
        invoiceUpdated: {
          _id: invoice._id,
          status: 'paid'
        }
      });
    }

    redisUtils.updateInvoiceStatus(invoice._id, 'paid');
  } catch (error) {
    return res.status(400).send(error);
  }

  return res.status(200).send('OK');
};

export const postHandler = async (req, res) => {
  const { route } = req;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { body } = req;

  const type = route.path
    .split('/')
    .slice(-1)
    .pop();

  try {
    let invoice: any;
    switch (type) {
      case PAYMENT_KINDS.SOCIAL_PAY:
        invoice = await socialPayHandler(models, body);
    }

    if (invoice) {
      graphqlPubsub.publish('invoiceUpdated', {
        invoiceUpdated: {
          _id: invoice._id,
          status: 'paid'
        }
      });
    }

    redisUtils.updateInvoiceStatus(invoice._id, 'paid');
  } catch (error) {
    return res.status(400).send(error);
  }

  return res.status(200).send('OK');
};

export const makeInvoiceNo = length => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const cancelPayment = (
  invoice: IInvoiceDocument,
  payment: IPaymentDocument
) => {
  switch (payment.kind) {
    case PAYMENT_KINDS.QPAY:
      // cancel qpay invoice
      qPayUtils.cancelInvoice(invoice.apiResponse.invoice_id, payment);
      break;
    case PAYMENT_KINDS.SOCIAL_PAY:
      // cancel socialpay invoice
      socialPayUtils.cancelInvoice(invoice, payment);
      break;
    default:
      break;
  }
};

export const createNewInvoice = async (
  invoice: IInvoiceDocument,
  payment: IPaymentDocument
) => {
  try {
    switch (payment.kind) {
      case PAYMENT_KINDS.QPAY:
        // create qpay invoice
        return qPayUtils.createInvoice(invoice, payment);
      case PAYMENT_KINDS.SOCIAL_PAY:
        // create socialpay invoice
        return socialPayUtils.createInvoice(invoice, payment);
      default:
        break;
    }
  } catch (e) {
    throw new Error(e.message);
  }
};
