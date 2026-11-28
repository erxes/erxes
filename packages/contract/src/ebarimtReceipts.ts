import { ebarimtReceipts, paymentInvoices } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { DedupeKey } from './platform';
import { EbarimtReceiptStatus } from './values';

const int = () => z.int();

export const EbarimtReceipt = createSelectSchema(ebarimtReceipts, {
  id: Id,
  invoiceId: () => Id,
  previousId: () => Id,
  totalAmount: int,
  totalVat: int,
  totalCityTax: int,
  inactiveAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    /** Null for one a plugin recorded for a sale with no invoice (a POS cash sale). */
    invoiceId: true,
    /**
     * The config that sent it; null for one sent before configs, by a setup removed since, or one
     * a plugin recorded without naming one.
     */
    settingsId: true,
    /** `put` issues a receipt (replacing `previousId`'s, if any); `return` cancels `previousId`'s. */
    kind: true,
    status: true,
    previousId: true,
    buyerType: true,
    customerTin: true,
    customerName: true,
    consumerNo: true,
    /** In the invoice currency's smallest unit. */
    totalAmount: true,
    totalVat: true,
    totalCityTax: true,
    billId: true,
    billDate: true,
    lottery: true,
    /** The text of the receipt's QR code. */
    qrData: true,
    error: true,
    /** Returned or replaced since. */
    inactiveAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    /**
     * Whose record it is for (`source`, `referenceType`, `referenceId`) and its currency: the
     * invoice's, or what the plugin that recorded it said (in tögrög).
     */
    ...createSelectSchema(paymentInvoices).pick({
      source: true,
      referenceType: true,
      referenceId: true,
      currency: true,
    }).shape,
    /** A plugin sent it to its own PosAPI and recorded it here (`recordReceipt`); core never sends it. */
    recorded: z.boolean(),
  });

export type EbarimtReceipt = z.infer<typeof EbarimtReceipt>;

const shortText = (max: number) => (column: z.ZodString) => column.trim().min(1).max(max);

const amount = () => z.int().min(0).max(1_000_000_000_00);

/**
 * A receipt a plugin that sends its own (`taxReceipts: 'own'`) issued at its PosAPI, as it
 * stands: amounts in möngö (tögrög × 100), as invoices keep them.
 */
export const RecordedReceipt = createUpdateSchema(ebarimtReceipts, {
  customerTin: shortText(14),
  customerName: shortText(200),
  consumerNo: shortText(20),
  totalAmount: amount,
  totalVat: amount,
  totalCityTax: amount,
  billId: shortText(64),
  billDate: shortText(40),
  lottery: shortText(40),
  qrData: shortText(2000),
  status: () => EbarimtReceiptStatus.exclude(['pending']),
  error: shortText(500),
  request: () => z.record(z.string(), z.unknown()),
  response: () => z.unknown(),
})
  .pick({
    /** `put` issued it (replacing `previousId`'s, if any); `return` cancelled `previousId`'s. */
    kind: true,
    /** `success`: PosAPI took it; `failed`: it refused, with `error`. */
    status: true,
    buyerType: true,
    customerTin: true,
    customerName: true,
    consumerNo: true,
    totalAmount: true,
    totalVat: true,
    totalCityTax: true,
    /** PosAPI's answer: the bill's id and date, the lottery number and the QR text. */
    billId: true,
    billDate: true,
    lottery: true,
    qrData: true,
    error: true,
    /** What the plugin sent PosAPI; its `receipts[].items` are the lines a print shows. */
    request: true,
    response: true,
  })
  .required({ kind: true, status: true, buyerType: true, totalAmount: true })
  .extend({
    /** The plugin's record it is for: `pos:order` and its id. */
    referenceType: z.string().trim().min(1).max(60),
    referenceId: z.string().trim().min(1).max(100),
    /** The plugin's key for this receipt; a retry with it answers the receipt recorded first. */
    dedupeKey: DedupeKey,
    /** The plugin's own invoice it is for, if any; a POS cash sale has none. */
    invoiceId: Id.optional(),
    /** Core's config with the merchant it went out for; it prints with that merchant, else the default's. */
    settingsId: Id.optional(),
    /** One the plugin recorded: a return cancels it, a put replaces it. */
    previousId: Id.optional(),
  })
  .refine((receipt) => receipt.kind === 'put' || receipt.previousId, {
    message: 'a return names the receipt it cancels (previousId)',
    path: ['previousId'],
  })
  .refine((receipt) => receipt.kind === 'return' || receipt.status === 'failed' || receipt.billId, {
    message: 'an issued receipt has its billId',
    path: ['billId'],
  })
  .refine((receipt) => receipt.buyerType === 'B2C_RECEIPT' || receipt.customerTin, {
    message: 'a company’s receipt has its customerTin',
    path: ['customerTin'],
  });

export type RecordedReceipt = z.infer<typeof RecordedReceipt>;

const { RECEIPT_NOT_IN_FORCE, TAX_RECEIPTS_NOT_OWN } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, RECEIPT_NOT_IN_FORCE, TAX_RECEIPTS_NOT_OWN });

/**
 * The organisation's one register of eBarimt receipts: core lists what it sent (`receipts`), and
 * a plugin that sends its own records what it sent here, so history, reprints and reports cover
 * every receipt.
 */
export const ebarimtRecordContract = {
  recordReceipt: base
    .route({
      method: 'POST',
      path: '/ebarimt/receipts/recorded',
      successStatus: 201,
      summary: 'Record a receipt a plugin issued',
      description:
        "Store a receipt the plugin sent to its own PosAPI, with or without one of its invoices, so it lists, prints and reports with the rest (plugins with `taxReceipts: 'own'` and payments:write). Core never sends it. A successful return or replacement marks `previousId`’s inactive. A retried `dedupeKey` answers the receipt recorded first (`created: false`). 403 TAX_RECEIPTS_NOT_OWN for a plugin core issues receipts for; 404 NOT_FOUND for an invoice, config or previous receipt that is not the plugin’s; 409 RECEIPT_NOT_IN_FORCE when `previousId` is not an issued receipt still in force",
    })
    .input(RecordedReceipt)
    .output(z.object({ receipt: EbarimtReceipt, created: z.boolean() })),
};
