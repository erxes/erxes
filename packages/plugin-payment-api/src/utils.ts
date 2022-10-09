import { getSubdomain } from '@erxes/api-utils/src/core';

import { qPayHandler } from './api/qPay/utils';
import { socialPayHandler } from './api/socialPay/utils';
import { graphqlPubsub } from './configs';
import { generateModels } from './connectionResolver';
import { PAYMENT_KINDS } from './constants';
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
