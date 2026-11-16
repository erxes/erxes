import { splitType } from 'erxes-api-shared/core-modules';
import { graphqlPubsub, sendWorkerQueue } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { PAYMENT_STATUS } from '~/constants';
import { enqueueInvoiceCallback } from '~/modules/payment/services/invoiceCallbackQueue';

/**
 * Sends the "invoice paid" notifications: the owning plugin's callback job
 * (e.g. POS settles the order) and the external invoice.callback.
 *
 * Called by whoever claimed the paid transition (checkInvoiceAndClaim sets
 * notifyPending: true in the same update). notifyPending is cleared only after
 * both notifications are queued; if anything fails it stays set and the
 * invoice re-check worker calls this again. Both jobs use fixed job ids kept for
 * a day, so a repeated call does not notify twice.
 */
export const notifyPaidInvoice = async (
  models: IModels,
  subdomain: string,
  invoiceId: string,
) => {
  const invoice = await models.Invoices.getInvoice({ _id: invoiceId }, true);

  graphqlPubsub.publish(`invoiceUpdated:${invoiceId}`, {
    invoiceUpdated: { _id: invoiceId, status: PAYMENT_STATUS.PAID },
  });

  // attempted independently, so one failing does not cancel the other
  let firstError: unknown;

  if (invoice.contentType) {
    const [pluginName, moduleName, collectionType] = splitType(
      invoice.contentType,
    );

    try {
      await sendWorkerQueue(pluginName, 'payments').add(
        'callback',
        {
          subdomain,
          data: {
            ...invoice,
            status: PAYMENT_STATUS.PAID,
            moduleName,
            collectionType,
            apiResponse: 'success',
          },
        },
        {
          jobId: `paid-invoice-${invoiceId}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 24 * 3600 },
        },
      );
    } catch (e) {
      firstError = firstError || e;
    }
  }

  try {
    await enqueueInvoiceCallback(invoice);
  } catch (e) {
    firstError = firstError || e;
  }

  if (firstError) {
    // notifyPending stays set, the cron retries
    throw firstError;
  }

  await models.Invoices.updateOne(
    { _id: invoiceId },
    { $unset: { notifyPending: 1 } },
  );
};
