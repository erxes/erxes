import { Job, Queue } from 'bullmq';
import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { PAYMENT_STATUS } from '~/constants';
import {
  INVOICE_CALLBACK_QUEUE,
  sendInvoiceCallback,
} from '~/modules/payment/services/invoiceCallbackQueue';
import { backfillInvoicePaymentKinds } from '~/modules/payment/services/invoicePaymentKinds';
import {
  IInvoiceRecheckJobData,
  INVOICE_RECHECK_QUEUE,
  INVOICE_RECHECK_SERVICE,
  scheduleInvoiceRecheck,
} from '~/modules/payment/services/invoiceRecheckQueue';
import { notifyPaidInvoice } from '~/modules/payment/services/paidInvoiceNotify';

const LOG_PREFIX = 'invoiceRecheck';

const log = (msg: string) => process.stdout.write(`[${LOG_PREFIX}] ${msg}\n`);
const logError = (msg: string) =>
  process.stderr.write(`[${LOG_PREFIX}] ${msg}\n`);

// The paymentKinds backfill runs for an org at most this often, and only for
// orgs that are taking payments (it piggybacks on their invoice re-checks).
const BACKFILL_INTERVAL_SECONDS = 60 * 60;

const backfillOnce = async (
  subdomain: string,
  models: IModels,
) => {
  const acquired = await redis.set(
    `payment:paymentKindsBackfill:${subdomain}`,
    '1',
    'EX',
    BACKFILL_INTERVAL_SECONDS,
    'NX',
  );

  if (!acquired) {
    return;
  }

  try {
    const backfilled = await backfillInvoicePaymentKinds(models);

    if (backfilled) {
      log(`${subdomain}: payment kinds backfilled on ${backfilled} invoices`);
    }
  } catch (e) {
    logError(`${subdomain}: payment kinds backfill failed: ${e.message}`);
  }
};

/**
 * Re-checks one invoice with its provider and sends its paid notification.
 * Queues the next check while there is still something to wait for.
 */
const runRecheck = async ({
  subdomain,
  invoiceId,
  attempt = 0,
}: IInvoiceRecheckJobData) => {
  const models = await generateModels(subdomain);

  await backfillOnce(subdomain, models);

  const invoice = await models.Invoices.findOne(
    { _id: invoiceId },
    { status: 1, notifyPending: 1 },
  ).lean();

  if (!invoice) {
    return 'invoice not found';
  }

  let notifyNeeded = false;

  if (invoice.status === PAYMENT_STATUS.PAID) {
    // paid by someone else (widget, provider callback); only a notification
    // that could not be sent is left to do
    notifyNeeded = !!invoice.notifyPending;
  } else if (invoice.status === PAYMENT_STATUS.PENDING) {
    try {
      const { status, claimed } = await models.Invoices.checkInvoiceAndClaim(
        invoiceId,
        subdomain,
      );

      if (status === PAYMENT_STATUS.PENDING) {
        await scheduleInvoiceRecheck(subdomain, invoiceId, attempt + 1);

        return `still pending (check ${attempt + 1})`;
      }

      if (status === PAYMENT_STATUS.PAID && claimed) {
        notifyNeeded = true;
        log(`${subdomain}: invoice ${invoiceId} found paid, notifying`);
      } else if (status === PAYMENT_STATUS.PAID) {
        // Someone else claimed it between our read and the check. If their
        // notification failed, notifyPending is still set and nobody else
        // will retry it; notifyPaidInvoice dedupes by invoice id, so sending
        // it here as well cannot notify twice.
        const after = await models.Invoices.findOne(
          { _id: invoiceId },
          { notifyPending: 1 },
        ).lean();

        notifyNeeded = !!after?.notifyPending;
      }
    } catch (e) {
      logError(
        `${subdomain}: failed to check invoice ${invoiceId}: ${e.message}`,
      );
      await scheduleInvoiceRecheck(subdomain, invoiceId, attempt + 1);

      return 'check failed, will retry';
    }
  }

  if (!notifyNeeded) {
    return 'done';
  }

  try {
    // dedupes the plugin job by invoice id and clears notifyPending
    await notifyPaidInvoice(models, subdomain, invoiceId);
  } catch (e) {
    logError(
      `${subdomain}: paid notification for invoice ${invoiceId} failed: ${e.message}`,
    );
    await scheduleInvoiceRecheck(subdomain, invoiceId, attempt + 1, {
      forNotification: true,
    });

    return 'notification failed, will retry';
  }

  return 'notified';
};

/**
 * Any failure outside the guarded steps above (models, Redis, the invoice
 * lookup) still queues the next check, so a transient error cannot end the
 * chain: the failed job itself is removed and has no BullMQ retries.
 */
const recheckInvoice = async (job: Job<IInvoiceRecheckJobData>) => {
  const data = job.data;

  if (!data?.subdomain || !data?.invoiceId) {
    return 'missing job data';
  }

  try {
    return await runRecheck(data);
  } catch (e) {
    logError(
      `${data.subdomain}: re-check of invoice ${data.invoiceId} failed: ${e.message}`,
    );
    // keep a notification retry on its extended limit
    await scheduleInvoiceRecheck(
      data.subdomain,
      data.invoiceId,
      (data.attempt ?? 0) + 1,
      { forNotification: data.forNotification },
    );

    return 'failed, will retry';
  }
};

// Queues of the per-org cron this worker replaces. Removed on startup so a
// deploy does not leave the old 5-minute schedule or its queued org jobs
// behind for an older instance to pick up.
const removeOldPendingInvoicesCron = async () => {
  const scheduler = new Queue(
    `${INVOICE_RECHECK_SERVICE}-pending-invoices-schedule`,
    { connection: redis },
  );
  const orgChecks = new Queue(
    `${INVOICE_RECHECK_SERVICE}-pending-invoices-check`,
    { connection: redis },
  );

  try {
    await scheduler.removeJobScheduler('pending-invoices-schedule');
    await scheduler.obliterate({ force: true });
    await orgChecks.obliterate({ force: true });
  } catch (e) {
    logError(`removing the old pending-invoice cron failed: ${e.message}`);
  } finally {
    await scheduler.close();
    await orgChecks.close();
  }
};

export const initInvoiceWorkers = async () => {
  await removeOldPendingInvoicesCron();

  createMQWorkerWithListeners(
    INVOICE_RECHECK_SERVICE,
    INVOICE_RECHECK_QUEUE,
    recheckInvoice,
    redis,
    () => log('invoice recheck worker ready'),
    { concurrency: 5 },
  );

  createMQWorkerWithListeners(
    INVOICE_RECHECK_SERVICE,
    INVOICE_CALLBACK_QUEUE,
    sendInvoiceCallback,
    redis,
    () => log('invoice callback worker ready'),
  );
};