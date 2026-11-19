/**
 * eBarimt receipts old erxes issued for deals (`put_responses`) → `core_ebarimt_receipts`. A core
 * receipt belongs to an invoice and old deal receipts had none, so each deal gets the invoice core
 * records for a payment taken outside a gateway (`recordPayment`): paid in full, for the amount of
 * its receipt in force, with that receipt's lines, cash when it was all cash, else a transfer.
 * Every receipt of the deal comes in on it: the one in force, those returned when the deal was
 * receipted again (`inactive_at`), and the tries PosAPI refused (`failed`).
 */
import { insert, readAll, type Run, unit } from './run';
import {
  amount,
  createdOf,
  idOf,
  minor,
  optionalId,
  plain,
  readOr,
  record,
  text,
  when,
} from './values';
import { z } from 'zod';

export const Receipt = record({
  contentId: optionalId,
  success: text,
  status: text,
  billId: text,
  billType: text,
  date: text,
  lottery: text,
  qrData: text,
  amount,
  vat: amount,
  cityTax: amount,
  cashAmount: amount,
  nonCashAmount: amount,
  customerNo: text,
  customerName: text,
  errorCode: text,
  message: text,
  internalCode: text,
  returnBillId: text,
  stocks: z.unknown().optional(),
  sendInfo: z.unknown().optional(),
  createdAt: when,
  modifiedAt: when,
});

type Receipt = NonNullable<ReturnType<typeof Receipt.parse>>;

const Stock = z.object({
  name: text,
  qty: amount,
  unitPrice: amount,
  totalAmount: amount,
  barCode: text,
});

const NAME = 'put_responses';
const INVOICES = `${NAME} (invoices)`;

const accepted = (receipt: Receipt) => receipt.success === 'true';

/** A company's receipt (PosAPI bill type 3) or a person's. */
const isCompany = (receipt: Receipt) => receipt.billType === '3';

/** The deal's invoice id: one per deal, the same on every run. */
const dealInvoiceId = (dealId: string) => `ebarimt-${dealId}`;

/** The receipt in force: the last one PosAPI accepted that wasn't returned. */
export const inForce = (receipts: Receipt[]) =>
  receipts.findLast((receipt) => accepted(receipt) && receipt.status !== 'inactive') ?? null;

/** The invoice line of each item on the receipt, in the smallest unit. */
const linesOf = (receipt: Receipt) =>
  (Array.isArray(receipt.stocks) ? receipt.stocks : []).flatMap((item) => {
    const stock = Stock.safeParse(item);

    return stock.success
      ? [
          {
            productId: null,
            name: stock.data.name ?? 'Item',
            quantity: stock.data.qty ?? 1,
            unitPrice: minor(stock.data.unitPrice) ?? 0,
            amount: minor(stock.data.totalAmount) ?? 0,
            plugin: 'sales',
            ...(stock.data.barCode && { barcode: stock.data.barCode }),
          },
        ]
      : [];
  });

/** The deal's recorded invoice, from the receipt in force. */
export const invoiceOf = (dealId: string, current: Receipt, first: Receipt) => {
  const paidAt = createdOf(current.id, current.createdAt);
  const total = minor(current.amount) ?? 0;
  const cashOnly = (current.cashAmount ?? 0) > 0 && (current.nonCashAmount ?? 0) <= 0;

  return [
    dealInvoiceId(dealId),
    null,
    cashOnly ? 'cash' : 'transfer',
    'sales',
    'deal',
    dealId,
    total,
    'MNT',
    `Deal paid outside a gateway (eBarimt ${current.billId ?? ''})`.replace(' ()', ''),
    'paid',
    JSON.stringify({ importedFrom: 'erxes 3 eBarimt receipts', dealId }),
    JSON.stringify(linesOf(current)),
    isCompany(current) && current.customerNo
      ? JSON.stringify({ companyNo: current.customerNo })
      : null,
    true,
    total,
    paidAt,
    paidAt,
    `officenext:put_responses:${dealId}`,
    createdOf(first.id, first.createdAt),
    current.modifiedAt ?? paidAt,
  ];
};

/** A receipt row; `previous` is the accepted receipt it replaced. */
export const receiptRow = (receipt: Receipt, invoiceId: string, previous: string | null) => {
  const at = createdOf(receipt.id, receipt.createdAt);
  const company = isCompany(receipt);
  const ok = accepted(receipt);

  return [
    receipt.id,
    invoiceId,
    'put',
    ok ? 'success' : 'failed',
    ok ? previous : null,
    company ? 'B2B_RECEIPT' : 'B2C_RECEIPT',
    company ? receipt.customerNo : null,
    receipt.customerName,
    company ? null : receipt.customerNo,
    minor(receipt.amount) ?? 0,
    minor(receipt.vat) ?? 0,
    minor(receipt.cityTax) ?? 0,
    receipt.billId,
    receipt.date,
    receipt.lottery,
    receipt.qrData,
    ok
      ? null
      : [receipt.errorCode, receipt.message].filter(Boolean).join(': ') || 'refused by PosAPI',
    JSON.stringify(plain(receipt.sendInfo ?? null)),
    JSON.stringify(
      plain({
        success: ok,
        billId: receipt.billId,
        date: receipt.date,
        lottery: receipt.lottery,
        internalCode: receipt.internalCode,
        returnBillId: receipt.returnBillId,
        errorCode: receipt.errorCode,
        message: receipt.message,
      }),
    ),
    receipt.status === 'inactive' ? (receipt.modifiedAt ?? at) : null,
    at,
    receipt.modifiedAt ?? at,
  ];
};

const INVOICE_COLUMNS = [
  'id',
  'gateway_id',
  'method',
  'source',
  'reference_type',
  'reference_id',
  'amount',
  'currency',
  'description',
  'status',
  'metadata',
  'lines',
  'tax_buyer',
  'tax_receipt',
  'paid_amount',
  'paid_at',
  'expires_at',
  'dedupe_key',
  'created_at',
  'updated_at',
];

const RECEIPT_COLUMNS = [
  'id',
  'invoice_id',
  'kind',
  'status',
  'previous_id',
  'buyer_type',
  'customer_tin',
  'customer_name',
  'consumer_no',
  'total_amount',
  'total_vat',
  'total_city_tax',
  'bill_id',
  'bill_date',
  'lottery',
  'qr_data',
  'error',
  'request',
  'response',
  'inactive_at',
  'created_at',
  'updated_at',
];

/** Each deal's receipts, oldest first. */
const byDeal = (receipts: Receipt[]) => {
  const deals = new Map<string, Receipt[]>();

  for (const receipt of receipts.toSorted(
    (a, b) => +createdOf(a.id, a.createdAt) - +createdOf(b.id, b.createdAt),
  )) {
    if (receipt.contentId)
      deals.set(receipt.contentId, [...(deals.get(receipt.contentId) ?? []), receipt]);
  }

  return deals;
};

/** Every deal's receipts, on the invoice made for it. */
export const importReceipts = async (run: Run) => {
  const receipts = (await readAll(run, NAME)).flatMap((raw) => {
    const receipt = readOr(Receipt, raw);

    if (!receipt) run.report.skip(NAME, 'unreadable _id', idOf(raw));

    return receipt ? [receipt] : [];
  });

  run.report.of(NAME, 'core_ebarimt_receipts');
  run.report.of(INVOICES, 'core_payment_invoices');
  run.report.seen(NAME, receipts.length);

  const invoices: unknown[][] = [];
  const rows: unknown[][] = [];
  const keys: string[] = [];

  for (const [dealId, ofDeal] of byDeal(receipts)) {
    const current = inForce(ofDeal);
    const first = ofDeal[0];

    if (!current || !first || (minor(current.amount) ?? 0) <= 0) {
      for (const receipt of ofDeal)
        run.report.skip(NAME, 'no receipt in force with an amount', receipt.id);
    } else {
      let previous: string | null = null;

      invoices.push(invoiceOf(dealId, current, first));

      for (const receipt of ofDeal) {
        rows.push(receiptRow(receipt, dealInvoiceId(dealId), previous));
        keys.push(receipt.id);

        if (accepted(receipt)) previous = receipt.id;
      }
    }
  }

  for (const receipt of receipts.filter((each) => !each.contentId)) {
    run.report.skip(NAME, 'no deal', receipt.id);
  }

  run.report.seen(INVOICES, invoices.length);

  // A receipt needs its invoice: both commit together.
  await unit(run, async () => {
    await insert(run, {
      collection: INVOICES,
      table: 'core_payment_invoices',
      columns: INVOICE_COLUMNS,
      rows: invoices,
      keys: invoices.map((row) => String(row[0])),
    });
    await insert(run, {
      collection: NAME,
      table: 'core_ebarimt_receipts',
      columns: RECEIPT_COLUMNS,
      rows,
      keys,
    });
  });
};
