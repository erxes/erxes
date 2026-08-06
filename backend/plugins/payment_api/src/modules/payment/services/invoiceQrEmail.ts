import { randomBytes } from 'crypto';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { buildTicketsPdf } from '~/modules/payment/services/ticketsPdf';

const getQuantity = (invoice: any): number => {
  const raw = invoice?.data?.quantity;
  const quantity = Number(raw);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
};

// Unguessable per-ticket token (16 hex chars, 64 bits of entropy).
const generateTicketCode = (): string => randomBytes(8).toString('hex');

const getTicketCodes = (invoice: any): string[] => {
  if (Array.isArray(invoice.ticketCodes) && invoice.ticketCodes.length) {
    return invoice.ticketCodes.map((ticket: any) => ticket.code);
  }
  // Legacy fallback for invoices created before random tokens existed.
  return [invoice.invoiceNumber || invoice._id];
};

export const sendInvoiceQrEmail = async (subdomain: string, invoice: any) => {
  if (!invoice.email) {
    return;
  }

  const title = invoice.description || 'Тасалбар';
  const amountStr = invoice.amount
    ? `${invoice.amount.toLocaleString()} ${invoice.currency || 'MNT'}`
    : '';

  const codes = getTicketCodes(invoice);

  const pdf = await buildTicketsPdf(codes, title);
  const pdfBase64 = pdf.toString('base64');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
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
              <h1 style="margin:8px 0 0;color:#fff;font-size:22px">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;text-align:center;border-bottom:2px dashed #e5e7eb">
              <p style="margin:0 0 8px;color:#111827;font-size:15px;font-weight:600">
                Танд ${codes.length} тасалбар байна
              </p>
              <p style="margin:0;color:#6b7280;font-size:13px">
                Хавсаргасан PDF файлаас QR кодоо уншуулан нэвтэрнэ үү.
              </p>
            </td>
          </tr>
          ${
            amountStr
              ? `<tr>
                   <td style="padding:24px 32px">
                     <table width="100%">
                       <tr>
                         <td style="color:#6b7280;font-size:13px">Төлсөн дүн</td>
                         <td style="color:#111827;font-size:13px;font-weight:600;text-align:right">
                           ${amountStr}
                         </td>
                       </tr>
                     </table>
                   </td>
                 </tr>`
              : ''
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
      attachments: [
        {
          filename: 'tickets.pdf',
          path: `data:application/pdf;base64,${pdfBase64}`,
          contentType: 'application/pdf',
        },
      ],
    },
    defaultValue: null,
  });
};

export const sendInvoiceQrEmailOnce = async (
  subdomain: string,
  models: any,
  invoice: any,
) => {
  const quantity = getQuantity(invoice);
  const ticketCodes = Array.from({ length: quantity }, () => ({
    code: generateTicketCode(),
    scannedAt: null,
  }));

  const claimed = await models.Invoices.findOneAndUpdate(
    { _id: invoice._id, qrEmailSentAt: null },
    { $set: { qrEmailSentAt: new Date(), ticketCodes } },
  );

  if (!claimed) {
    process.stdout.write(
      `[invoiceQrEmail] Skipped invoice ${invoice._id}: QR email already sent\n`,
    );
    return;
  }

  try {
    await sendInvoiceQrEmail(subdomain, { ...invoice, ticketCodes });

    process.stdout.write(
      `[invoiceQrEmail] Sent QR email for invoice ${invoice._id} to ${invoice.email}\n`,
    );
  } catch (e) {
    // release the claim so the next paid-check retries instead of staying silent
    await models.Invoices.updateOne(
      { _id: invoice._id },
      { $unset: { qrEmailSentAt: '' } },
    );

    throw e;
  }
};
