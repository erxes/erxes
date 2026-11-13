import { sendWorkerQueue } from 'erxes-api-shared/utils';

export const INVOICE_RECHECK_SERVICE = 'payment';
export const INVOICE_RECHECK_QUEUE = 'invoice-recheck';

/**
 * Delay before each re-check of one invoice, counted from the previous one.
 * About 16 hours in total; an invoice still pending after the last check is
 * left alone (the customer abandoned it, or it is settled by other means).
 */
export const RECHECK_DELAYS_MS = [
  2 * 60 * 1000,
  5 * 60 * 1000,
  10 * 60 * 1000,
  30 * 60 * 1000,
  60 * 60 * 1000,
  2 * 60 * 60 * 1000,
  4 * 60 * 60 * 1000,
  8 * 60 * 60 * 1000,
];

// A paid invoice whose notification keeps failing is retried past the
// re-check schedule, every 8 hours for about three more days.
const NOTIFY_MAX_ATTEMPTS = RECHECK_DELAYS_MS.length + 9;

export interface IInvoiceRecheckJobData {
  subdomain: string;
  invoiceId: string;
  attempt: number;
}

/**
 * Queues the next re-check of one invoice with its provider.
 *
 * This replaces the old pending-invoice cron, which walked every org every
 * five minutes. Work is created only where a payment actually happened: the
 * first check is queued when a transaction is created, and each check queues
 * the next one while the invoice is still pending or its paid notification
 * still has to be sent.
 *
 * The job id includes the attempt, so many transactions on one invoice (a
 * customer retrying payment) share one waiting check instead of piling up.
 */
export const scheduleInvoiceRecheck = async (
  subdomain: string,
  invoiceId: string,
  attempt = 0,
  { forNotification = false }: { forNotification?: boolean } = {},
) => {
  const maxAttempts = forNotification
    ? NOTIFY_MAX_ATTEMPTS
    : RECHECK_DELAYS_MS.length;

  if (!invoiceId || attempt >= maxAttempts) {
    return;
  }

  // past the end of the schedule, keep the longest delay
  const delay =
    RECHECK_DELAYS_MS[Math.min(attempt, RECHECK_DELAYS_MS.length - 1)];

  await sendWorkerQueue(INVOICE_RECHECK_SERVICE, INVOICE_RECHECK_QUEUE).add(
    INVOICE_RECHECK_QUEUE,
    { subdomain: subdomain || 'os', invoiceId, attempt },
    {
      delay,
      jobId: `${INVOICE_RECHECK_QUEUE}-${invoiceId}-${attempt}`,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
};
