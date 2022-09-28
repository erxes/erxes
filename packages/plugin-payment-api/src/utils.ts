import { getSubdomain } from '@erxes/api-utils/src/core';

import { PAYMENT_TYPES } from '../constants';
import { graphqlPubsub } from './configs';
import { generateModels, IModels } from './connectionResolver';
import { qPayHandler } from './payments/qPay/utils';
import { socialPayHandler } from './payments/socialPay/utils';

export const getHandler = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { query } = req;
  const { type } = query;

  if (!type) {
    return res.status(400).send('Type is required');
  }

  try {
    let invoice: any;
    switch (type) {
      case PAYMENT_TYPES.QPAY:
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
      case PAYMENT_TYPES.SOCIAL_PAY:
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

export const getModel = (type: string, models: IModels) => {
  switch (type) {
    case PAYMENT_TYPES.QPAY:
      return models.QpayInvoices;
    case PAYMENT_TYPES.SOCIAL_PAY:
      return models.SocialPayInvoices;
  }
};

export const createInvoice = async (models: IModels, params) => {
  const {
    paymentId,
    amount,
    description,
    phone,
    customerId,
    companyId,
    contentType,
    contentTypeId
  } = params;
  const paymentConfig = await models.PaymentConfigs.findOne({
    _id: paymentId
  });

  if (!paymentConfig) {
    throw new Error(`Config not found with id ${paymentId}`);
  }

  const { config, type } = paymentConfig;

  const data = {
    config,
    amount,
    invoice_description: description,
    phone,
    customerId,
    companyId,
    contentType,
    contentTypeId
  };

  const model: any = getModel(type, models);

  return model.createInvoice(data);
};
