import { splitType } from 'erxes-api-shared/core-modules';
import {
  getEnv,
  isEnabled,
  sendTRPCMessage,
  sendWorkerMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { create as createQrCode } from 'qrcode';
import { IModels } from '~/connectionResolvers';
import { PAYMENT_STATUS } from '~/constants';
import { IInvoice, IInvoiceDocument } from '~/modules/payment/@types/invoices';
import {
  ITransaction,
  ITransactionDocument,
} from '~/modules/payment/@types/transactions';

type InvoiceLike = Partial<IInvoice> & {
  _id: string;
};

type TransactionLike = Partial<ITransaction> & {
  _id: string;
};

type InvoiceInput = InvoiceLike | IInvoiceDocument;
type TransactionInput = TransactionLike | ITransactionDocument;

type Plainable<T> = T & {
  toObject?: () => T;
};

const DEFAULT_CALLBACK_TIMEOUT_MS = 10000;

/** Normalizes unknown errors for safe logging. */
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Checks whether a Mongoose document-like value can be converted to a plain object. */
const isPlainable = <T>(doc: T): doc is Plainable<T> =>
  typeof doc === 'object' &&
  doc !== null &&
  'toObject' in doc &&
  typeof doc.toObject === 'function';

/** Converts Mongoose documents to plain objects while leaving already-plain values untouched. */
const toPlainObject = <T>(doc: T): T => {
  if (!isPlainable(doc)) {
    return doc;
  }

  if (typeof doc.toObject === 'function') {
    return doc.toObject();
  }

  return doc;
};

/** Splits an erxes content type into the plugin/module/collection parts used by workers. */
const getContentContext = (contentType?: string) => {
  if (!contentType) {
    return null;
  }

  const [pluginName, moduleName, collectionType] = splitType(contentType);

  if (!pluginName) {
    return null;
  }

  return { pluginName, moduleName, collectionType };
};

/** Sends the paid-invoice QR/barcode email through the core notification service. */
export const sendInvoiceBarcodeEmail = async (
  subdomain: string,
  invoice: {
    email?: string;
    invoiceNumber?: string;
    _id: string;
    amount?: number;
    currency?: string;
    description?: string;
  },
) => {
  if (!invoice.email) {
    throw new Error(`Invoice ${invoice._id} has no email address`);
  }

  const ticketCode = invoice.invoiceNumber || invoice._id;
  const title = invoice.description || 'Тасалбар';
  const amountStr = invoice.amount
    ? `${invoice.amount.toLocaleString()} ${invoice.currency || 'MNT'}`
    : '';

  let qrTableHtml = '';

  try {
    const qr = createQrCode(ticketCode, {
      errorCorrectionLevel: 'M',
    });
    const { size, data } = qr.modules;
    const cell = 6;

    qrTableHtml = `
    <table cellpadding="0" cellspacing="0" border="0"
      style="border-collapse:collapse;background:#fff;border:16px solid #fff">
      ${Array.from(
        { length: size },
        (_, r) => `
        <tr height="${cell}">
          ${Array.from(
            { length: size },
            (_, c) => `
            <td
              width="${cell}"
              height="${cell}"
              style="
                width:${cell}px;
                height:${cell}px;
                background:${data[r * size + c] ? '#000' : '#fff'};
                padding:0;
                border:none;
                font-size:0;
                line-height:0;
              "
            ></td>
          `,
          ).join('')}
        </tr>
      `,
      ).join('')}
    </table>
  `;
  } catch (err) {
    throw new Error(`Failed to generate QR code: ${getErrorMessage(err)}`);
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
          style="background:#fff;border-radius:12px;overflow:hidden">

          <tr>
            <td style="background:#111827;padding:24px 32px;text-align:center">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-transform:uppercase">
                Төлбөр амжилттай
              </p>

              <h1 style="margin:8px 0 0;color:#fff;font-size:22px">
                ${title}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;text-align:center;border-bottom:2px dashed #e5e7eb">
              <p style="margin:0 0 16px;color:#6b7280;font-size:13px">
                QR кодыг уншуулан нэвтрэнэ үү
              </p>

              <div align="center">${qrTableHtml}</div>

              <p style="margin:16px 0 0;color:#374151;font-size:13px;font-family:monospace">
                ${ticketCode}
              </p>
            </td>
          </tr>
          ${
            amountStr &&
            `
            <tr>
              <td style="padding:24px 32px">
                <table width="100%">
                  <tr>
                    <td style="color:#6b7280;font-size:13px">
                      Төлсөн дүн
                    </td>

                    <td style="color:#111827;font-size:13px;font-weight:600;text-align:right">
                      ${amountStr}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `
          }
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'notifications',
    action: 'sendEmail',
    input: {
      toEmails: [invoice.email],
      title: `Тасалбар – ${title}`,
      customHtml: html,
    },
    defaultValue: null,
  });
};

/** Finds the paid transaction that should drive payment-method specific side effects. */
const getPaidTransaction = async (
  models: IModels,
  invoiceId: string,
  transaction?: TransactionInput,
): Promise<TransactionInput | null> => {
  if (transaction) {
    const transactionObj = toPlainObject(transaction);

    return transactionObj.status === PAYMENT_STATUS.PAID
      ? transactionObj
      : null;
  }

  return models.Transactions.findOne({
    invoiceId,
    status: PAYMENT_STATUS.PAID,
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();
};

/** Atomically claims invoice-level paid side effects so emails/callbacks run once. */
const claimInvoicePaidSideEffects = async ({
  models,
  invoiceId,
  invoiceWasPaid,
}: {
  models: IModels;
  invoiceId: string;
  invoiceWasPaid: boolean;
}) => {
  if (invoiceWasPaid) {
    return false;
  }

  const now = new Date();
  const result = await models.Invoices.updateOne(
    {
      _id: invoiceId,
      status: PAYMENT_STATUS.PAID,
      'sideEffects.invoicePaidAt': { $exists: false },
    },
    {
      $set: {
        'sideEffects.invoicePaidAt': now,
      },
    },
  );

  return result.modifiedCount > 0;
};

/** Atomically claims a transaction callback so repeated provider callbacks do not duplicate it. */
const claimTransactionCallback = async ({
  models,
  invoiceId,
  transactionId,
  invoiceWasPaid,
}: {
  models: IModels;
  invoiceId: string;
  transactionId: string;
  invoiceWasPaid: boolean;
}) => {
  if (invoiceWasPaid) {
    return false;
  }

  const now = new Date();
  const result = await models.Invoices.updateOne(
    {
      _id: invoiceId,
      [`sideEffects.transactionCallbacks.${transactionId}`]: {
        $exists: false,
      },
    },
    {
      $set: {
        [`sideEffects.transactionCallbacks.${transactionId}`]: now,
      },
    },
  );

  return result.modifiedCount > 0;
};

/** Sends the paid-invoice email unless the selected payment method disables it. */
const maybeSendPaymentEmail = async ({
  models,
  subdomain,
  invoice,
  transaction,
}: {
  models: IModels;
  subdomain: string;
  invoice: InvoiceInput;
  transaction?: TransactionInput | null;
}) => {
  if (!invoice.email) {
    return;
  }

  const paymentId = transaction?.paymentId || invoice.paymentIds?.[0];
  const payment = paymentId
    ? await models.PaymentMethods.findOne({ _id: paymentId }).lean()
    : null;

  if (payment?.sendEmailOnPayment === false) {
    return;
  }

  sendInvoiceBarcodeEmail(subdomain, invoice).catch((error) => {
    console.error(
      `[payment] Failed to request paid invoice email for invoice ${invoice._id}: ${getErrorMessage(error)}`,
    );
  });
};

/** Enqueues or runs the target plugin's payment worker callback. */
const enqueueWorkerCallback = async ({
  subdomain,
  pluginName,
  jobName,
  data,
  waitForWorker,
}: {
  subdomain: string;
  pluginName: string;
  jobName: string;
  data: Record<string, unknown>;
  waitForWorker: boolean;
}) => {
  if (!(await isEnabled(pluginName))) {
    return;
  }

  if (waitForWorker) {
    await sendWorkerMessage({
      subdomain,
      pluginName,
      queueName: 'payments',
      jobName,
      data,
      defaultValue: null,
    });

    return;
  }

  await sendWorkerQueue(pluginName, 'payments').add(
    jobName,
    { subdomain, data },
    { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
  );
};

/** Reads the external callback timeout, falling back to a safe default. */
const getCallbackTimeoutMs = () => {
  const configured = Number(
    getEnv({
      name: 'PAYMENT_CALLBACK_TIMEOUT_MS',
      defaultValue: String(DEFAULT_CALLBACK_TIMEOUT_MS),
    }),
  );

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_CALLBACK_TIMEOUT_MS;
};

/** Posts the public invoice callback payload with a timeout and logs failures. */
const callExternalCallback = async (invoice: InvoiceLike) => {
  if (!invoice.callback) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getCallbackTimeoutMs());

  try {
    const response = await fetch(invoice.callback, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: invoice._id,
        amount: invoice.amount,
        status: PAYMENT_STATUS.PAID,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error(
      `[payment] External callback failed for invoice ${invoice._id}: ${getErrorMessage(error)}`,
    );
  } finally {
    clearTimeout(timeout);
  }
};

/** Runs all first-paid invoice side effects with persisted idempotency guards. */
export const runPaidInvoiceSideEffects = async ({
  models,
  subdomain,
  invoice,
  invoiceWasPaid,
  transaction,
  includeTransactionCallback = false,
  includeInvoicePaidSideEffects = true,
  waitForWorker = false,
}: {
  models: IModels;
  subdomain: string;
  invoice: InvoiceInput;
  invoiceWasPaid: boolean;
  transaction?: TransactionInput;
  includeTransactionCallback?: boolean;
  includeInvoicePaidSideEffects?: boolean;
  waitForWorker?: boolean;
}) => {
  const invoiceObj = toPlainObject(invoice);
  const contentContext = getContentContext(invoiceObj.contentType);
  const paidTransaction = await getPaidTransaction(
    models,
    invoiceObj._id,
    transaction,
  );

  const shouldRunTransactionCallback =
    includeTransactionCallback &&
    paidTransaction &&
    contentContext &&
    (await claimTransactionCallback({
      models,
      invoiceId: invoiceObj._id,
      transactionId: paidTransaction._id,
      invoiceWasPaid,
    }));

  if (shouldRunTransactionCallback && paidTransaction && contentContext) {
    const transactionObj = toPlainObject(paidTransaction);
    delete transactionObj.response;

    await enqueueWorkerCallback({
      subdomain,
      pluginName: contentContext.pluginName,
      jobName: 'transactionCallback',
      waitForWorker,
      data: {
        ...transactionObj,
        moduleName: contentContext.moduleName,
        collectionType: contentContext.collectionType,
        apiResponse: 'success',
      },
    }).catch((error) => {
      console.error(
        `[payment] Transaction callback failed for invoice ${invoiceObj._id}: ${getErrorMessage(error)}`,
      );
    });
  }

  if (!includeInvoicePaidSideEffects) {
    return;
  }

  const shouldRunInvoicePaidSideEffects = await claimInvoicePaidSideEffects({
    models,
    invoiceId: invoiceObj._id,
    invoiceWasPaid,
  });

  if (!shouldRunInvoicePaidSideEffects) {
    return;
  }

  await maybeSendPaymentEmail({
    models,
    subdomain,
    invoice: invoiceObj,
    transaction: paidTransaction,
  });

  if (contentContext) {
    await enqueueWorkerCallback({
      subdomain,
      pluginName: contentContext.pluginName,
      jobName: 'callback',
      waitForWorker,
      data: {
        ...invoiceObj,
        status: PAYMENT_STATUS.PAID,
        moduleName: contentContext.moduleName,
        collectionType: contentContext.collectionType,
        apiResponse: 'success',
      },
    }).catch((error) => {
      console.error(
        `[payment] Invoice callback failed for invoice ${invoiceObj._id}: ${getErrorMessage(error)}`,
      );
    });
  }

  void callExternalCallback(invoiceObj);
};
