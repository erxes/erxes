import { type Db, requestOrgId } from '@erxes/core-db';
import { recordAudit } from '~/modules/audit/audit.service';
import { sendEmail } from '~/modules/email/email';
import { type PrintData, QR_CID, qrPng, renderReceipt } from './print';
import { printableReceipt } from './printTemplates.service';

const amount = new Intl.NumberFormat('mn-MN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** The receipt in plain text, for mail apps that show no HTML. */
const textOf = (data: PrintData) =>
  [
    data.companyName,
    `ТТД: ${data.merchantTin}`,
    data.billId ? `ДДТД: ${data.billId}` : '',
    data.billDate ? `Огноо: ${data.billDate}` : '',
    '',
    ...data.lines.map(
      (line) =>
        `${line.name}  ${line.qty} × ${amount.format(line.unitPrice)} = ${amount.format(line.totalAmount)}`,
    ),
    '',
    `Нийт дүн: ${amount.format(data.totalAmount)}`,
    `НӨАТ: ${amount.format(data.totalVat)}`,
    data.lottery ? `Сугалаа: ${data.lottery}` : '',
  ]
    .filter((line, index, all) => line || all[index - 1])
    .join('\n');

/**
 * Emails an issued receipt, as its plugin's template prints it, with its QR
 * code as an image. Queued in the request's transaction; audited.
 */
export const emailReceipt = async (client: Db, { id, to }: { id: string; to: string }) => {
  const { receipt, template, data } = await printableReceipt(client, id);
  const html = await renderReceipt(template, data, 'email');
  const qr = data.qrData ? await qrPng(data.qrData) : null;

  await sendEmail(client, requestOrgId(), {
    to,
    template: 'rendered',
    fromName: data.companyName,
    data: {
      subject: `И-баримт · ${data.companyName}${data.billId ? ` · ${data.billId}` : ''}`,
      html,
      text: textOf(data),
    },
    attachments: qr
      ? [{ cid: QR_CID, filename: 'ebarimt-qr.png', base64: qr.toString('base64') }]
      : undefined,
  });

  await recordAudit(client, {
    action: 'ebarimt.receipt_emailed',
    targetType: 'ebarimt_receipt',
    targetId: receipt.id,
    targetLabel: data.billId ?? receipt.id,
    metadata: { to },
  });

  return { ok: true as const };
};
