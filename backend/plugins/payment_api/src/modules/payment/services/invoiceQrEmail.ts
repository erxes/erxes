import { sendTRPCMessage } from 'erxes-api-shared/utils';
import * as QRCode from 'qrcode';

const buildQrTableHtml = (code: string): string => {
  const qr = (QRCode as any).create(code, { errorCorrectionLevel: 'M' });
  const { size, data } = qr.modules;
  const cell = 6;

  return `
    <table cellpadding="0" cellspacing="0" border="0"
      style="border-collapse:collapse;background:#fff;border:16px solid #fff">
      ${Array.from(
        { length: size },
        (_, r) => `
        <tr height="${cell}">
          ${Array.from(
            { length: size },
            (_, c) => `
            <td width="${cell}" height="${cell}"
              style="width:${cell}px;height:${cell}px;background:${
                data[r * size + c] ? '#000' : '#fff'
              };padding:0;border:none;font-size:0;line-height:0;"></td>
          `,
          ).join('')}
        </tr>
      `,
      ).join('')}
    </table>
  `;
};

const getQuantity = (invoice: any): number => {
  const raw = invoice?.data?.quantity;
  const quantity = Number(raw);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
};

const buildTicketCodes = (invoice: any): string[] => {
  const base = invoice.invoiceNumber || invoice._id;
  const quantity = getQuantity(invoice);

  if (quantity <= 1) {
    return [base];
  }

  return Array.from({ length: quantity }, (_, index) => `${base}-${index + 1}`);
};

export const sendInvoiceQrEmail = async (subdomain: string, invoice: any) => {
  if (!invoice.email) {
    return;
  }

  const title = invoice.description || 'Тасалбар';
  const amountStr = invoice.amount
    ? `${invoice.amount.toLocaleString()} ${invoice.currency || 'MNT'}`
    : '';

  const codes = buildTicketCodes(invoice);

  const ticketsHtml = codes
    .map(
      (code, index) => `
      <tr>
        <td style="padding:24px 32px;text-align:center;border-bottom:2px dashed #e5e7eb">
          ${
            codes.length > 1
              ? `<p style="margin:0 0 8px;color:#111827;font-size:13px;font-weight:600">
                   Тасалбар ${index + 1} / ${codes.length}
                 </p>`
              : ''
          }
          <p style="margin:0 0 16px;color:#6b7280;font-size:13px">
            QR кодыг уншуулан нэвтрэнэ үү
          </p>
          <div align="center">${buildQrTableHtml(code)}</div>
          <p style="margin:16px 0 0;color:#374151;font-size:13px;font-family:monospace">
            ${code}
          </p>
        </td>
      </tr>
    `,
    )
    .join('');

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
          ${ticketsHtml}
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
    },
    defaultValue: null,
  });
};

export const sendInvoiceQrEmailOnce = async (
  subdomain: string,
  models: any,
  invoice: any,
) => {
  // `qrEmailSentAt: null` matches both a missing field and an explicit null
  const claimed = await models.Invoices.findOneAndUpdate(
    { _id: invoice._id, qrEmailSentAt: null },
    { $set: { qrEmailSentAt: new Date() } },
  );

  if (!claimed) {
    process.stdout.write(
      `[invoiceQrEmail] Skipped invoice ${invoice._id}: QR email already sent\n`,
    );
    return;
  }

  try {
    await sendInvoiceQrEmail(subdomain, invoice);

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
