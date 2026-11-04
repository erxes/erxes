import { Job } from 'bullmq';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { PAYMENT_STATUS } from '~/constants';
import { IInvoice } from '~/modules/payment/@types/invoices';

export const PAYMENT_SERVICE = 'payment';
export const INVOICE_CALLBACK_QUEUE = 'paid-invoice-callback';

export type InvoiceCallbackTarget = Pick<IInvoice, 'amount' | 'callback'> & {
  _id: string;
};

interface IInvoiceCallbackJobData {
  url: string;
  body: { _id: string; amount: number; status: string };
}

/**
 * Queues the external invoice.callback delivery. The worker below retries
 * network errors and non-2xx responses, so a paid notification is not lost
 * when the receiver is briefly down. One job per invoice (fixed jobId).
 */
export const enqueueInvoiceCallback = async (
  invoice: InvoiceCallbackTarget,
) => {
  if (!invoice.callback) {
    return;
  }

  const data: IInvoiceCallbackJobData = {
    url: invoice.callback,
    body: {
      _id: invoice._id,
      amount: invoice.amount,
      status: PAYMENT_STATUS.PAID,
    },
  };

  await sendWorkerQueue(PAYMENT_SERVICE, INVOICE_CALLBACK_QUEUE).add(
    INVOICE_CALLBACK_QUEUE,
    data,
    {
      jobId: `${INVOICE_CALLBACK_QUEUE}-${invoice._id}`,
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: { age: 7 * 24 * 3600 },
    },
  );
};

export const sendInvoiceCallback = async (
  job: Job<IInvoiceCallbackJobData>,
) => {
  const { url, body } = job.data || ({} as IInvoiceCallbackJobData);

  if (!url) {
    return;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // throwing makes BullMQ retry with backoff
    throw new Error(
      `Callback for invoice ${body?._id} failed: HTTP ${res.status} ${res.statusText}`,
    );
  }
};
