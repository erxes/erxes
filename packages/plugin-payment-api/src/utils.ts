import { getSubdomain } from '@erxes/api-utils/src/core';

import { monpayCallbackHandler } from './api/monpay/api';
import { paypalCallbackHandler } from './api/paypal/api';
import { qpayCallbackHandler } from './api/qpay/api';
import { socialpayCallbackHandler } from './api/socialpay/api';
import { storepayCallbackHandler } from './api/storepay/api';
import { graphqlPubsub } from './configs';
import { generateModels } from './connectionResolver';
import { PAYMENTS, PAYMENT_STATUS } from './api/constants';
import redisUtils from './redisUtils';
import { quickQrCallbackHandler } from './api/qpayQuickqr/api';
import messageBroker from './messageBroker';
import { pocketCallbackHandler } from './api/pocket/api';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

export const callbackHandler = async (req, res) => {
  const { route, body, query } = req;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const kind =
    query.kind ||
    route.path
      .split('/')
      .slice(-1)
      .pop();

  if (!kind) {
    return res.status(400).send('kind is required');
  }

  let invoiceDoc: any;

  const data = { ...body, ...query };

  try {
    switch (kind) {
      case PAYMENTS.storepay.kind:
        invoiceDoc = await storepayCallbackHandler(models, data);
        break;
      case PAYMENTS.socialpay.kind:
        invoiceDoc = await socialpayCallbackHandler(models, data);
        break;
      case PAYMENTS.qpay.kind:
        invoiceDoc = await qpayCallbackHandler(models, data);
        break;
      case PAYMENTS.monpay.kind:
        invoiceDoc = await monpayCallbackHandler(models, data);
        break;
      case PAYMENTS.paypal.kind:
        invoiceDoc = await paypalCallbackHandler(models, data);
        break;
      case PAYMENTS.qpayQuickqr.kind:
        invoiceDoc = await quickQrCallbackHandler(models, data);
        break;
      case PAYMENTS.pocket.kind:
        invoiceDoc = await pocketCallbackHandler(models, data);
        break;
      default:
        return res.status(400).send('Invalid kind');
    }

    if (invoiceDoc.status === PAYMENT_STATUS.PAID) {
      graphqlPubsub.publish('invoiceUpdated', {
        invoiceUpdated: {
          _id: invoiceDoc._id,
          status: 'paid'
        }
      });

      redisUtils.updateInvoiceStatus(invoiceDoc._id, 'paid');

      const [serviceName] = invoiceDoc.contentType.split(':');

      if (await isEnabled(serviceName)) {
        messageBroker().sendMessage(`${serviceName}:paymentCallback`, {
          subdomain,
          data: {
            ...invoiceDoc,
            apiResponse: 'success'
          }
        });
      }
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
