import { getSubdomain } from '@erxes/api-utils/src/core';

import { monpayCallbackHandler } from './api/monpay/api';
import { paypalCallbackHandler } from './api/paypal/api';
import { qpayCallbackHandler } from './api/qpay/api';
import { socialpayCallbackHandler } from './api/socialpay/api';
import { storepayCallbackHandler } from './api/storepay/api';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { generateModels } from './connectionResolver';
import { PAYMENTS, PAYMENT_STATUS } from './api/constants';
import redisUtils from './redisUtils';
import { quickQrCallbackHandler } from './api/qpayQuickqr/api';
import { pocketCallbackHandler } from './api/pocket/api';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { sendMessage } from '@erxes/api-utils/src/messageBroker';
import { ITransactionDocument } from './models/definitions/transactions';
import { golomtCallbackHandler } from './api/golomt/api';

export const callbackHandler = async (req, res) => {
  const { route, body, query } = req;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const kind = query.kind || route.path.split('/').slice(-1).pop();

  if (!kind) {
    return res.status(400).send('kind is required');
  }

  let transaction: ITransactionDocument;

  const data = { ...body, ...query };

  try {
    switch (kind) {
      case PAYMENTS.socialpay.kind:
        transaction = await socialpayCallbackHandler(models, data);
        break;
      case PAYMENTS.qpay.kind:
        transaction = await qpayCallbackHandler(models, data);
        break;
      case PAYMENTS.monpay.kind:
        transaction = await monpayCallbackHandler(models, data);
        break;
      case PAYMENTS.qpayQuickqr.kind:
        transaction = await quickQrCallbackHandler(models, data);
        break;
      case PAYMENTS.pocket.kind:
        transaction = await pocketCallbackHandler(models, data);
        break;
      case PAYMENTS.storepay.kind:
        transaction = await storepayCallbackHandler(models, data);
        break;
      case PAYMENTS.golomt.kind:
        transaction = await golomtCallbackHandler(models, data);
      default:
        return res.status(400).send('Invalid kind');
    }

    if (transaction.status === PAYMENT_STATUS.PAID) {
      const invoice = await models.Invoices.findOne({
        _id: transaction.invoiceId,
      }).lean();

      if (!invoice) {
        return res.status(400).send('Invoice not found');
      }

      const result = await models.Invoices.checkInvoice(transaction.invoiceId);

      delete transaction.response;

      graphqlPubsub.publish(`transactionUpdated:${transaction.invoiceId}`, {
        transactionUpdated: {
          _id: transaction._id,
          status: 'paid',
          amount: transaction.amount,
          paymentKind: transaction.paymentKind,
        },
      });

      if (result === 'paid') {
        graphqlPubsub.publish(`invoiceUpdated:${transaction.invoiceId}`, {
          invoiceUpdated: {
            _id: transaction.invoiceId,
            status: 'paid',
          },
        });
      }

      // remove next line after new payment ui is implemented
      redisUtils.updateInvoiceStatus(transaction._id, 'paid');

      const [serviceName] = invoice.contentType.split(':');

      if (await isEnabled(serviceName)) {
        try {
          sendMessage(`${serviceName}:transactionCallback`, {
            subdomain,
            data: {
              ...transaction,
              apiResponse: 'success',
            },
          });

          if (result === 'paid') {
            sendMessage(`${serviceName}:paymentCallback`, {
              subdomain,
              data: {
                ...invoice,
                status: 'paid',
              },
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  } catch (error) {
    return res.status(400).send(error);
  }

  return res.status(200).send('OK');
};
