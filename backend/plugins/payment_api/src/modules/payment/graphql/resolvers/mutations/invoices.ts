import { splitType } from 'erxes-api-shared/core-modules';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  getEnv,
  graphqlPubsub,
  sendWorkerQueue,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IInvoice, IInvoiceDocument } from '~/modules/payment/@types/invoices';
import * as QRCode from 'qrcode';
async function sendInvoiceBarcodeEmail(
  subdomain: string,
  invoice: {
    email?: string;
    invoiceNumber?: string;
    _id: string;
    amount?: number;
    currency?: string;
    description?: string;
  },
) {
  const ticketCode = invoice.invoiceNumber || invoice._id;
  const title = invoice.description || 'Тасалбар';
  const amountStr = invoice.amount
    ? `${invoice.amount.toLocaleString()} ${invoice.currency || 'MNT'}`
    : '';

  let qrTableHtml = '';

  try {
    const qr = (QRCode as any).create(ticketCode, {
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
    throw new Error(`Failed to generate QR code: ${err.message}`);
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
}

const mutations: Record<string, Resolver<any, any, IContext>> = {
  async generateInvoiceUrl(
    _root,
    { input }: { input: IInvoice },
    { models }: IContext,
  ) {
    const domain = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:5173';

    const invoice = await models.Invoices.createInvoice({
      ...input,
    });

    return `${domain}/pl:payment/widget/invoice/${invoice._id}`;
  },

  async invoiceCreate(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    const invoice = await models.Invoices.createInvoice(
      {
        ...input,
      },
      subdomain,
    );
    return invoice;
  },

  async cpInvoiceCreate(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    const invoice = await models.Invoices.createInvoice(
      {
        ...input,
      },
      subdomain,
    );
    return invoice;
  },

  async invoicesCheck(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext,
  ) {
    const status = await models.Invoices.checkInvoice(_id, subdomain);

    if (status === 'paid') {
      const invoice = await models.Invoices.getInvoice({ _id }, true);

      const paymentId = invoice.paymentIds?.[0];
      const payment = paymentId
        ? await models.PaymentMethods.findOne({ _id: paymentId }).lean()
        : null;
      if (payment?.sendEmailOnPayment !== false) {
        await models.Invoices.updateOne({ _id }, { sendEmailOnPayment: true });
        sendInvoiceBarcodeEmail(subdomain, invoice).catch(() => undefined);
      }

      if (invoice.contentType) {
        const [pluginName, moduleName, collectionType] = splitType(
          invoice.contentType,
        );

        // Fire-and-forget: enqueue without waiting for the worker to finish
        sendWorkerQueue(pluginName, 'payments')
          .add(
            'callback',
            {
              subdomain,
              data: {
                ...invoice,
                status: 'paid',
                moduleName,
                collectionType,
                apiResponse: 'success',
              },
            },
            { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
          )
          .catch((err) => {
            process.stderr.write(
              `[invoicesCheck] Failed to enqueue worker job for invoice ${_id}: ${err.message}\n`,
            );
          });
      }

      if (invoice.callback) {
        // Fire callback – do not await
        fetch(invoice.callback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: invoice._id,
            amount: invoice.amount,
            status: 'paid',
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} – ${res.statusText}`);
            }
            console.log(
              `[invoicesCheck] Callback succeeded for invoice ${_id}`,
            );
          })
          .catch((err) => {
            console.error(
              `[invoicesCheck] Callback failed for invoice ${_id}:`,
              err,
            );
          });
      }
    }

    return status;
  },
  // --- END OF UPDATED MUTATION ---

  async cpInvoicesCheck(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext,
  ) {
    const status = await models.Invoices.checkInvoice(_id, subdomain);

    if (status === 'paid') {
      const invoice = await models.Invoices.getInvoice({ _id }, true);

      if (invoice.contentType) {
        const [pluginName, moduleName, collectionType] = splitType(
          invoice.contentType,
        );

        // Fire worker message – do not await
        sendWorkerMessage({
          subdomain,
          pluginName: 'payment',
          queueName: 'payments',
          jobName: 'paymentCallback',
          data: {
            ...invoice,
            status: 'paid',
            moduleName,
            collectionType,
            apiResponse: 'success',
          },
          defaultValue: null,
          timeout: 30000, // keep increased timeout
          options: {
            //  added this to enable retries
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          },
        })
          .then(() => {})
          .catch((err) => {
            process.stderr.write(
              `[invoicesCheck] Worker message failed for invoice ${_id}: ${err.stack}\n`,
            );
          });
      }

      if (invoice.callback) {
        // Fire callback – do not await
        fetch(invoice.callback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: invoice._id,
            amount: invoice.amount,
            status: 'paid',
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} – ${res.statusText}`);
            }
            console.log(
              `[invoicesCheck] Callback succeeded for invoice ${_id}`,
            );
          })
          .catch((err) => {
            console.error(
              `[invoicesCheck] Callback failed for invoice ${_id}:`,
              err,
            );
          });
      }
    }

    return status;
  },

  async invoiceScanBarcode(
    _root,
    { code }: { code: string },
    { models }: IContext,
  ) {
    const invoice = await models.Invoices.findOne({
      invoiceNumber: code,
    }).lean();

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'paid') {
      throw new Error('Invoice is not paid');
    }

    const scanned = await models.Invoices.scanBarcode(code);

    graphqlPubsub.publish(`invoiceUpdated:${scanned._id}`, {
      invoiceUpdated: scanned,
    });

    graphqlPubsub.publish('invoiceScanned', {
      invoiceScanned: scanned,
    });

    return scanned;
  },

  async invoicesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Invoices.removeInvoices(_ids);
  },

  async invoiceUpdate(
    _root,
    { _id, paymentId }: { _id: string; paymentId: string },
    { models, subdomain }: IContext,
  ) {
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:5173';
    const domain = DOMAIN.replace('<subdomain>', subdomain);

    return models.Invoices.updateInvoice(_id, {
      selectedPaymentId: paymentId,
      domain,
    });
  },
};

export default mutations;

mutations.generateInvoiceUrl.wrapperConfig = {
  skipPermission: true,
};
mutations.invoiceCreate.wrapperConfig = {
  skipPermission: true,
};
mutations.invoicesCheck.wrapperConfig = {
  skipPermission: true,
};

mutations.cpInvoiceCreate.wrapperConfig = {
  skipPermission: true,
  forClientPortal: true,
};

mutations.invoiceScanBarcode.wrapperConfig = {
  skipPermission: true,
};

mutations.cpInvoicesCheck.wrapperConfig = {
  forClientPortal: true,
};
