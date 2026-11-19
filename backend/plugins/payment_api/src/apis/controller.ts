import { splitType } from 'erxes-api-shared/core-modules';
import {
  getSubdomain,
  graphqlPubsub,
  isEnabled,
  sendWorkerMessage,
} from 'erxes-api-shared/utils';

import {
  golomtCallbackHandler,
  notificationHandler as golomtNotificationHandler,
} from '~/apis/golomt/api';
import { minupayCallbackHandler } from '~/apis/minupay/api';
import { monpayCallbackHandler } from '~/apis/monpay/api';
import { pocketCallbackHandler } from '~/apis/pocket/api';
import { qpayCallbackHandler } from '~/apis/qpay/api';
import { quickQrCallbackHandler } from '~/apis/qpayQuickqr/api';
import { socialpayCallbackHandler } from '~/apis/socialpay/api';
import { storepayCallbackHandler } from '~/apis/storepay/api';
import { stripeCallbackHandler } from '~/apis/stripe/api';
import { tdbCallbackHandler } from '~/apis/tdb/api';
import { generateModels } from '~/connectionResolvers';
import { PAYMENT_STATUS, PAYMENTS } from '~/constants';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { notifyPaidInvoice } from '~/modules/payment/services/paidInvoiceNotify';
import { tokiCallbackHandler } from '~/apis/toki/api';
import redis from '~/utils/redis';
import {
  claimTransactionCallback,
  releaseTransactionCallback,
} from '~/utils/transactionCallback';

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

  // Toki's mini-program callback is server-to-server and expects JSON back
  const isTokiMiniProgram =
    kind === PAYMENTS.toki.kind && !!(data.orderID || data.transRequestId);

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
      case PAYMENTS.tdb.kind:
        transaction = await tdbCallbackHandler(models, subdomain, data);
        break;
      case PAYMENTS.toki.kind:
        transaction = await tokiCallbackHandler(models, data);
        break;
      default:
        return res.status(400).send('Invalid kind');
    }
    // Providers that redirect the customer here after a failed payment:
    // show the failed page instead of a bare error. (Toki mini-program
    // callbacks are server-to-server, so they are left out.)
    const redirectsOnFailure =
      transaction.paymentKind === PAYMENTS.tdb.kind ||
      (transaction.paymentKind === PAYMENTS.toki.kind && !isTokiMiniProgram);

    if (
      redirectsOnFailure &&
      [
        PAYMENT_STATUS.CANCELLED,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.EXPIRED,
      ].includes(transaction.status)
    ) {
      try {
        await models.Invoices.checkInvoice(transaction.invoiceId, subdomain);
      } catch (error) {
        console.error('[CALLBACK] Failed to update invoice status', {
          invoiceId: transaction.invoiceId,
          transactionId: transaction._id,
          error,
        });
      }

      return res.redirect(
        `/gateway/pl:payment/widget/payment-failed/${transaction.invoiceId}`,
      );
    }
    if (
      transaction.status === PAYMENT_STATUS.CANCELLED ||
      transaction.status === PAYMENT_STATUS.FAILED ||
      transaction.status === PAYMENT_STATUS.EXPIRED
    ) {
      return res.status(400).send('Payment failed, cancelled or expired');
    }

    if (transaction.status === PAYMENT_STATUS.PAID) {
      const invoice = await models.Invoices.findOne({
        _id: transaction.invoiceId,
      }).lean();

      if (!invoice) {
        return res.status(400).send('Invoice not found');
      }

      const { status: result, claimed } =
        await models.Invoices.checkInvoiceAndClaim(
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

      // Hand a paid transaction to the owning plugin only once, even when the
      // provider retries its callback
      if (
        invoice.contentType &&
        (await claimTransactionCallback(String(transaction._id)))
      ) {
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
                ...transaction.toObject(),
                moduleName,
                collectionType,
                apiResponse: 'success',
              },
              defaultValue: null,
            });
          } catch (e) {
            console.error('Error: ', e);
            await releaseTransactionCallback(String(transaction._id));
          }
        }
      }

      // notify only if this callback moved the invoice to paid; if this
      // fails, notifyPending stays set and the invoice re-check worker retries
      if (claimed) {
        try {
          await notifyPaidInvoice(models, subdomain, invoice._id);
        } catch (e) {
          console.error(
            `[CALLBACK] Failed to queue paid notifications for invoice ${invoice._id}`,
            e,
          );
        }
      }

      if (invoice.redirectUri && !isTokiMiniProgram) {
        return res.redirect(invoice.redirectUri);
      }
    }
  } catch (error) {
    return res.status(400).send(error?.message || String(error));
  }

  if (isTokiMiniProgram) {
    return res.status(200).json({ status: 'success' });
  }

  return res.status(200).send('OK');
};

/**
 * Golomt push notification endpoint: /pl:payment/notification/golomt
 * Golomt has to enable push notifications for the merchant with this URL.
 */
export const golomtNotificationRoute = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    return await golomtNotificationHandler(
      models,
      subdomain,
      { ...req.query, ...req.body },
      res,
    );
  } catch (e) {
    console.error('[golomt notification] failed', e);
    return res.status(500).json({ status: 'error', message: e.message });
  }
};
