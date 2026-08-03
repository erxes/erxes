import { splitType } from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IPaymentDealConfig } from '~/modules/payment/@types/payment';

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
};

type PaymentLike = {
  sendEmailOnPayment?: boolean;
  dealConfig?: IPaymentDealConfig;
} | null;

export const resolvePaymentForInvoice = async (models: any, invoice: any) => {
  const paidTx = await models.Transactions.findOne({
    invoiceId: invoice._id,
    status: 'paid',
  }).lean();

  const paymentId =
    paidTx?.paymentId || invoice.selectedPaymentId || invoice.paymentIds?.[0];

  return paymentId
    ? models.PaymentMethods.findOne({ _id: paymentId }).lean()
    : null;
};

export const enqueuePaidInvoiceCallback = (
  subdomain: string,
  invoice: any,
  payment: PaymentLike,
  logPrefix: string,
) => {
  const sendEmailOnPayment = payment?.sendEmailOnPayment !== false;
  const dealConfig = payment?.dealConfig;

  const baseData = {
    ...invoice,
    status: 'paid',
    apiResponse: 'success',
    sendEmailOnPayment,
    dealConfig,
  };

  const enqueue = (pluginName: string, data: Record<string, any>) =>
    sendWorkerQueue(pluginName, 'payments')
      .add('callback', { subdomain, data }, JOB_OPTIONS)
      .catch((err) => {
        process.stderr.write(
          `[${logPrefix}] Failed to enqueue ${pluginName} job for invoice ${invoice._id}: ${err.message}\n`,
        );
      });

  if (invoice.contentType) {
    const [pluginName, moduleName, collectionType] = splitType(
      invoice.contentType,
    );
    enqueue(pluginName, { ...baseData, moduleName, collectionType });
  }

  if (dealConfig?.enabled && invoice.contentType !== 'sales:deal') {
    sendWorkerQueue('sales', 'payments')
      .add(
        'createDealFromPayment',
        { subdomain, data: { ...baseData, dealConfig } },
        JOB_OPTIONS,
      )
      .catch((err) => {
        process.stderr.write(
          `[${logPrefix}] Failed to enqueue sales deal job for invoice ${invoice._id}: ${err.message}\n`,
        );
      });
  }
};
