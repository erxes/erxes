import { EBARIMT_PRINT_BLOCKS } from '@erxes/core-db/enums';
import type { EbarimtPrintBlock, ebarimtPrintTemplates } from '@erxes/core-db';
import QRCode from 'qrcode';
import { z } from 'zod';

type Template = Pick<
  typeof ebarimtPrintTemplates.$inferSelect,
  'paperSize' | 'blocks' | 'headerText' | 'footerText'
>;

/** A line as PosAPI got it, in tögrög. */
const PrintLine = z.object({
  name: z.string(),
  qty: z.number(),
  unitPrice: z.number(),
  totalAmount: z.number(),
});

export type PrintLine = z.infer<typeof PrintLine>;

/** What a receipt prints: the merchant, PosAPI's answer and the lines, amounts in tögrög. */
export interface PrintData {
  companyName: string;
  merchantTin: string;
  branchNo: string;
  posNo: string;
  billId: string | null;
  billDate: string | null;
  lottery: string | null;
  qrData: string | null;
  buyerType: 'B2C_RECEIPT' | 'B2B_RECEIPT';
  customerTin: string | null;
  customerName: string | null;
  consumerNo: string | null;
  lines: PrintLine[];
  totalAmount: number;
  totalVat: number;
  totalCityTax: number;
}

/** Every part, visible, in the default order. */
export const defaultBlocks = (): EbarimtPrintBlock[] =>
  EBARIMT_PRINT_BLOCKS.map((type) => ({ type, visible: true }));

/** The saved parts in their order, then any part added to core since, visible. */
export const allBlocks = (blocks: EbarimtPrintBlock[]): EbarimtPrintBlock[] => [
  ...blocks,
  ...defaultBlocks().filter((block) => !blocks.some((saved) => saved.type === block.type)),
];

const PosApiLines = z.object({
  receipts: z.array(z.object({ items: z.array(PrintLine) })),
});

/** The lines of what core sent PosAPI for a receipt; none when it isn't PosAPI's shape. */
export const linesOfRequest = (request: unknown): PrintLine[] =>
  PosApiLines.safeParse(request).data?.receipts.flatMap((receipt) => receipt.items) ?? [];

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escape = (text: string) => text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);

const amount = new Intl.NumberFormat('mn-MN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (value: number) => escape(amount.format(value));

const row = (label: string, value: string) =>
  `<div class="row"><span>${escape(label)}</span><span>${escape(value)}</span></div>`;

const text = (value: string) => (value ? `<p class="text">${escape(value)}</p>` : '');

const merchant = (data: PrintData) =>
  [
    `<h1>${escape(data.companyName)}</h1>`,
    row('ТТД', data.merchantTin),
    data.branchNo ? row('Салбар', data.branchNo) : '',
    data.posNo ? row('ПОС', data.posNo) : '',
  ].join('');

const bill = (data: PrintData) =>
  [
    data.billId ? row('ДДТД', data.billId) : '',
    data.billDate ? row('Огноо', data.billDate) : '',
  ].join('');

const buyer = (data: PrintData) => {
  if (data.buyerType === 'B2B_RECEIPT') {
    return [
      data.customerName ? row('Худалдан авагч', data.customerName) : '',
      data.customerTin ? row('Худалдан авагчийн ТТД', data.customerTin) : '',
    ].join('');
  }

  return data.consumerNo ? row('Иргэн', data.consumerNo) : '';
};

const lines = (data: PrintData) => {
  const body = data.lines
    .map(
      (line) =>
        `<tr><td>${escape(line.name)}<div class="muted">${escape(String(line.qty))} × ${money(line.unitPrice)}</div></td><td class="num">${money(line.totalAmount)}</td></tr>`,
    )
    .join('');

  return `<table><thead><tr><th>Бараа</th><th class="num">Дүн</th></tr></thead><tbody>${body}</tbody></table>`;
};

const totals = (data: PrintData) =>
  [
    `<div class="row total"><span>Нийт дүн</span><span>${money(data.totalAmount)}</span></div>`,
    `<div class="row"><span>НӨАТ</span><span>${money(data.totalVat)}</span></div>`,
    data.totalCityTax
      ? `<div class="row"><span>НХАТ</span><span>${money(data.totalCityTax)}</span></div>`
      : '',
  ].join('');

const qrSvg = async (qrData: string) =>
  `<div class="qr">${await QRCode.toString(qrData, { type: 'svg', margin: 0 })}</div>`;

const lottery = (data: PrintData) =>
  data.lottery ? `<div class="lottery">Сугалаа: ${escape(data.lottery)}</div>` : '';

const PAGE: Record<Template['paperSize'], { page: string; width: string; font: string }> = {
  '58mm': { page: '58mm auto', width: '54mm', font: '11px' },
  '80mm': { page: '80mm auto', width: '74mm', font: '12px' },
  a4: { page: 'A4', width: '120mm', font: '13px' },
};

const css = (paper: Template['paperSize']) => {
  const { page, width, font } = PAGE[paper];

  return [
    `@page{size:${page};margin:${paper === 'a4' ? '15mm' : '2mm'}}`,
    '*{box-sizing:border-box}',
    `body{margin:0;color:#000;background:#fff;font:${font}/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}`,
    `main{width:${width};margin:0 auto}`,
    'main>section{padding:4px 0;border-bottom:1px dashed #000}',
    'main>section:last-child{border-bottom:0}',
    'h1{margin:0 0 2px;font-size:1.15em;text-align:center}',
    '.row{display:flex;justify-content:space-between;gap:8px}',
    '.row span:last-child{text-align:right;word-break:break-all}',
    '.total{font-weight:700;font-size:1.1em}',
    '.text{margin:0;white-space:pre-line;text-align:center}',
    'table{width:100%;border-collapse:collapse}',
    'th{text-align:left;font-weight:600;border-bottom:1px solid #000}',
    'td{vertical-align:top;padding:2px 0}',
    '.num{text-align:right;white-space:nowrap}',
    '.muted{color:#444;font-size:.9em}',
    '.qr{display:flex;justify-content:center;padding:4px 0}',
    '.qr svg,.qr img{width:60%;max-width:160px;height:auto}',
    '.lottery{text-align:center;font-weight:700;font-size:1.1em}',
  ].join('');
};

/** The QR code's content id in an email, whose PNG goes along as an attachment. */
export const QR_CID = 'ebarimt-qr';

/** The QR code as a PNG, for email: mail apps show no inline SVG. */
export const qrPng = (qrData: string) =>
  QRCode.toBuffer(qrData, { type: 'png', margin: 1, width: 320 });

/** `print`: the QR code drawn in the page; `email`: an image the email attaches. */
type Medium = 'print' | 'email';

const qrFor = (data: PrintData, medium: Medium) => {
  if (!data.qrData) return '';

  return medium === 'email'
    ? `<div class="qr"><img src="cid:${QR_CID}" width="160" height="160" alt="QR"></div>`
    : qrSvg(data.qrData);
};

const BLOCKS: Record<
  EbarimtPrintBlock['type'],
  (data: PrintData, template: Template, medium: Medium) => string | Promise<string>
> = {
  merchant,
  header: (_, template) => text(template.headerText),
  bill,
  buyer,
  lines,
  totals,
  qr: (data, _, medium) => qrFor(data, medium),
  lottery,
  footer: (_, template) => text(template.footerText),
};

/** The receipt as a whole HTML page for its paper, its parts in the template's order. */
export const renderReceipt = async (
  template: Template,
  data: PrintData,
  medium: Medium = 'print',
) => {
  const visible = allBlocks(template.blocks).filter((block) => block.visible);

  const parts = await Promise.all(
    visible.map(async (block) => {
      const html = await BLOCKS[block.type](data, template, medium);

      return html ? `<section data-block="${block.type}">${html}</section>` : '';
    }),
  );

  const sections = parts.join('');

  return [
    '<!doctype html><html lang="mn"><head><meta charset="utf-8">',
    `<title>${escape(data.billId ? `Баримт ${data.billId}` : 'Баримт')}</title>`,
    `<style>${css(template.paperSize)}</style></head><body><main>${sections}</main></body></html>`,
  ].join('');
};
