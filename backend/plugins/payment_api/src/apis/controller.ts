import { splitType } from 'erxes-api-shared/core-modules';
import {
  getSubdomain,
  graphqlPubsub,
  isEnabled,
  sendWorkerMessage,
} from 'erxes-api-shared/utils';

import { golomtCallbackHandler } from '~/apis/golomt/api';
import { minupayCallbackHandler } from '~/apis/minupay/api';
import { monpayCallbackHandler } from '~/apis/monpay/api';
import { pocketCallbackHandler } from '~/apis/pocket/api';
import { qpayCallbackHandler } from '~/apis/qpay/api';
import { quickQrCallbackHandler } from '~/apis/qpayQuickqr/api';
import { socialpayCallbackHandler } from '~/apis/socialpay/api';
import { storepayCallbackHandler } from '~/apis/storepay/api';
import { stripeCallbackHandler } from '~/apis/stripe/api';
import { generateModels } from '~/connectionResolvers';
import { PAYMENT_STATUS, PAYMENTS } from '~/constants';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import redis from '~/utils/redis';

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
        break;
      case PAYMENTS.stripe.kind:
        transaction = await stripeCallbackHandler(models, data);
        break;
      case PAYMENTS.minupay.kind:
        transaction = await minupayCallbackHandler(models, data);
        break;
      default:
        return res.status(400).send('Invalid kind');
    }

    if (
      transaction.status === PAYMENT_STATUS.CANCELLED ||
      transaction.status === PAYMENT_STATUS.FAILED
    ) {
      return res.status(400).send('Payment failed or cancelled');
    }

    if (transaction.status === PAYMENT_STATUS.PAID) {
      const invoice = await models.Invoices.findOne({
        _id: transaction.invoiceId,
      }).lean();

      if (!invoice) {
        return res.status(400).send('Invoice not found');
      }

      const result = await models.Invoices.checkInvoice(
        transaction.invoiceId,
        subdomain,
      );

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

      redis.updateInvoiceStatus(transaction._id, 'paid');

      const [pluginName, moduleName, collectionType] = splitType(
        invoice.contentType,
      );

      if (await isEnabled(pluginName)) {
        try {
          await sendWorkerMessage({
            subdomain,
            pluginName,
            queueName: 'payments',
            jobName: 'transactionCallback',
            data: {
              ...transaction,
              moduleName,
              collectionType,
              apiResponse: 'success',
            },
            defaultValue: null,
          });

          if (result === 'paid') {
            await sendWorkerMessage({
              subdomain,
              pluginName,
              queueName: 'payments',
              jobName: 'callback',
              data: {
                ...invoice,
                status: 'paid',
                moduleName,
                collectionType,
              },
              defaultValue: null,
            });
          }

          if (invoice.callback) {
            try {
              await fetch(invoice.callback, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  _id: invoice._id,
                  amount: invoice.amount,
                  status: 'paid',
                }),
              });
            } catch (e) {
              console.error('Error: ', e);
            }
          }
        } catch (e) {
          console.error('Error: ', e);
        }
      }
    }
  } catch (error) {
    return res.status(400).send(error);
  }

  return res.status(200).send('OK');
};
