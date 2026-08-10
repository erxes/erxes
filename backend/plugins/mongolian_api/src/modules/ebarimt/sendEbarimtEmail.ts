import { sendTRPCMessage } from 'erxes-api-shared/utils';
import * as QRCode from 'qrcode';
import { IReceipt } from './@types';

interface RelatedContact {
  primaryEmail?: string | null;
}

export interface EbarimtEmailDeal {
  _id: string;
  name?: string;
  number: string;
}

export interface EbarimtEmailResponse {
  _id: string;
  id: string;
  status: string;
  companyName?: string;
  consumerNo?: string;
  customerName?: string;
  customerTin?: string;
  date?: string;
  description?: string;
  footerText?: string;
  headerText?: string;
  lottery?: string;
  merchantTin?: string;
  message?: string;
  number?: string;
  qrData?: string;
  receipts?: IReceipt[];
  registerNo?: string;
  totalAmount?: number;
  totalCityTax?: number;
  totalVAT?: number;
}

interface SendEbarimtEmailParams {
  deal: EbarimtEmailDeal;
  responses: EbarimtEmailResponse[];
  subdomain: string;
}

interface InlineEmailAttachment {
  cid: string;
  content: string;
  contentType: 'image/png';
  filename: string;
}

const escapeHtml = (value: string | number | null | undefined) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return entities[character];
  });

const formatText = (value: string) =>
  escapeHtml(value).replace(/\r?\n/g, '<br />');

const formatAmount = (amount?: number) =>
  Number(amount || 0).toLocaleString('mn-MN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

const getRelatedContacts = async (
  subdomain: string,
  dealId: string,
  contactType: 'company' | 'customer',
): Promise<RelatedContact[]> => {
  const isCustomer = contactType === 'customer';
  const relatedIds: string[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: 'sales:deal',
      contentId: dealId,
      relatedContentType: isCustomer ? 'core:customer' : 'core:company',
    },
    defaultValue: [],
  });

  if (!relatedIds.length) {
    return [];
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: isCustomer ? 'customers' : 'companies',
    action: isCustomer ? 'findActiveCustomers' : 'findActiveCompanies',
    input: {
      query: { _id: { $in: relatedIds } },
      fields: { primaryEmail: 1 },
      skip: 0,
      limit: relatedIds.length,
    },
    defaultValue: [],
  });
};

const getRecipientEmails = async (subdomain: string, dealId: string) => {
  const contacts = (
    await Promise.all([
      getRelatedContacts(subdomain, dealId, 'customer'),
      getRelatedContacts(subdomain, dealId, 'company'),
    ])
  ).flat();

  return Array.from(
    new Set(
      contacts
        .map(({ primaryEmail }) => primaryEmail?.trim().toLowerCase())
        .filter((email): email is string => Boolean(email)),
    ),
  );
};

const getReceiptRows = (receipts: IReceipt[]) => {
  let itemIndex = 0;
  let totalDiscount = 0;
  const rows: string[] = [];

  for (const receipt of receipts) {
    for (const item of receipt.items || []) {
      itemIndex += 1;
      const discount = item.unitPrice * item.qty - item.totalAmount;
      totalDiscount += discount;

      rows.push(`
        <tr>
          <td colspan="4" style="padding:5px;font-weight:bold;text-align:left">
            ${itemIndex}. ${escapeHtml(item.name)}
          </td>
        </tr>
        <tr>
          <td style="padding:5px;text-align:right">${formatAmount(item.unitPrice)}</td>
          <td style="padding:5px;text-align:right">${escapeHtml(item.qty)}</td>
          <td style="padding:5px;text-align:right">${formatAmount(discount)}</td>
          <td style="padding:5px;text-align:right">${formatAmount(item.totalAmount)}</td>
        </tr>
      `);
    }
  }

  return { rows: rows.join(''), totalDiscount };
};

const getCustomerInfo = (response: EbarimtEmailResponse) => {
  if (!(response.customerTin || response.customerName)) {
    return '';
  }

  return `
    <div style="margin-top:16px">
      <p style="margin:5px 0 10px"><strong>Худалдан авагч:</strong></p>
      ${response.customerTin ? `<p style="margin:5px 0">ТТД: ${escapeHtml(response.customerTin)}</p>` : ''}
      ${response.consumerNo ? `<p style="margin:5px 0">РД: ${escapeHtml(response.consumerNo)}</p>` : ''}
      ${response.customerName ? `<p style="margin:5px 0">Нэр: ${escapeHtml(response.customerName)}</p>` : ''}
    </div>
  `;
};

const getConfiguredText = (value: string | undefined, fallback: string) =>
  value ? `<div>${formatText(value)}</div>` : fallback;

const getReceiptSection = (
  response: EbarimtEmailResponse,
  index: number,
  qrContentId: string,
) => {
  const { rows, totalDiscount } = getReceiptRows(response.receipts || []);

  return `
    <div style="width:270px;margin:0 auto;padding:16px 0;color:#000;font-family:Arial,Helvetica,sans-serif;font-size:13px">
      ${index > 0 ? '<div style="margin-bottom:16px;border-top:1px dashed #444"></div>' : ''}
      <div style="text-align:center">
        <strong style="font-size:18px">eBarimt</strong>
      </div>
      ${response.companyName ? `<p style="margin:5px 0 10px;text-align:center">${escapeHtml(response.companyName)}</p>` : ''}

      <div>
        ${response.merchantTin ? `<p style="margin:5px 0">ТТД: ${escapeHtml(response.merchantTin)}</p>` : ''}
        <p style="margin:5px 0">ДДТД: ${escapeHtml(response.id)}</p>
        <p style="margin:5px 0">Огноо: ${escapeHtml(response.date)}</p>
        ${response.number ? `<p style="margin:5px 0">№: ${escapeHtml(response.number)}</p>` : ''}
      </div>

      ${getCustomerInfo(response)}
      ${getConfiguredText(response.headerText, '<br />')}

      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="padding:5px;border-top:1px dashed #444;border-bottom:1px dashed #444;text-align:left">Нэгж үнэ</th>
            <th style="padding:5px;border-top:1px dashed #444;border-bottom:1px dashed #444;text-align:left">Тоо</th>
            <th style="padding:5px;border-top:1px dashed #444;border-bottom:1px dashed #444;text-align:left">Хөн</th>
            <th style="padding:5px;border-top:1px dashed #444;border-bottom:1px dashed #444;text-align:left">Нийт үнэ</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="margin-top:30px;text-align:right">
        ${response.totalVAT && response.totalVAT > 0 ? `<p style="margin:5px 0"><strong>НӨАТ:</strong> ${formatAmount(response.totalVAT)}</p>` : ''}
        ${response.totalCityTax && response.totalCityTax > 0 ? `<p style="margin:5px 0"><strong>НХАТ:</strong> ${formatAmount(response.totalCityTax)}</p>` : ''}
        <p style="margin:5px 0"><strong>Бүгд үнэ:</strong> ${formatAmount(response.totalAmount)}</p>
        ${totalDiscount > 0 ? `<p style="margin:5px 0"><strong>ХӨН:</strong> ${formatAmount(totalDiscount)}</p>` : ''}
      </div>

      <div style="text-align:center">
        ${response.lottery ? `<div style="margin-top:20px;font-weight:bold">Сугалаа: ${escapeHtml(response.lottery)}</div>` : ''}
        ${qrContentId ? `<img src="cid:${escapeHtml(qrContentId)}" width="220" height="220" alt="И-Баримтын QR код" style="display:block;margin:10px auto" />` : ''}
        ${getConfiguredText(response.footerText, '<p style="margin:5px 0;font-weight:bold;font-size:12px">Манайхаар үйлчлүүлсэн танд баярлалаа !!!</p>')}
        ${response.description ? `<div>${formatText(response.description)}</div>` : ''}
      </div>
    </div>
  `;
};

export const sendEbarimtEmail = async ({
  deal,
  responses,
  subdomain,
}: SendEbarimtEmailParams) => {
  const successfulResponses = responses.filter(
    ({ id, status }) => id && status === 'SUCCESS',
  );

  if (!successfulResponses.length) {
    return;
  }

  const toEmails = await getRecipientEmails(subdomain, deal._id);

  if (!toEmails.length) {
    return;
  }

  const receiptSections: string[] = [];
  const attachments: InlineEmailAttachment[] = [];

  for (const [index, response] of successfulResponses.entries()) {
    let qrContentId = '';

    if (response.qrData) {
      try {
        const qrImage = await QRCode.toBuffer(response.qrData, {
          errorCorrectionLevel: 'M',
          margin: 4,
          type: 'png',
          width: 600,
        });
        qrContentId = `ebarimt-${deal._id}-${index + 1}@erxes`;
        attachments.push({
          cid: qrContentId,
          content: qrImage.toString('base64'),
          contentType: 'image/png',
          filename: `ebarimt-${index + 1}.png`,
        });
      } catch {
        qrContentId = '';
      }
    }

    receiptSections.push(getReceiptSection(response, index, qrContentId));
  }

  const receiptLabel =
    deal.name || deal.number || successfulResponses[0].number;
  const title = receiptLabel ? `И-Баримт - ${receiptLabel}` : 'И-Баримт';

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'notifications',
    action: 'sendEmail',
    input: {
      attachments,
      customHtml: receiptSections.join(''),
      title,
      toEmails,
    },
    defaultValue: null,
  });
};
