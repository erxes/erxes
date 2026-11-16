import { EBARIMT_TAX_TYPES } from '@erxes/core-db/enums';
import { ebarimtReceipts, ebarimtSettings, paymentInvoices } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, isoDate } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { EbarimtReceiptStatus } from './values';

/**
 * Who the invoice's tax receipt is for, where the organisation issues them
 * (eBarimt): a company by its registration (7 digits) or tax number, or a
 * person by their 8-digit eBarimt consumer number. None: a receipt for a person.
 */
export const TaxBuyer = z
  .object({
    companyNo: z
      .string()
      .trim()
      .regex(/^(\d{7}|\d{11}|\d{12}|\d{14}|[А-ЯЁӨҮ]{2}\d{8})$/iu, 'a registration or tax number')
      .optional(),
    consumerNo: z
      .string()
      .trim()
      .regex(/^\d{8}$/, '8 digits')
      .optional(),
  })
  .refine((buyer) => !(buyer.companyNo && buyer.consumerNo), 'a company or a person, not both');

export type TaxBuyer = z.infer<typeof TaxBuyer>;

/** Lines of these products, or of products in these categories, are taxed this way. */
export const EbarimtTaxRule = z.object({
  productIds: z.array(Id).max(500),
  categoryIds: z.array(Id).max(100),
  taxType: z.enum(EBARIMT_TAX_TYPES),
  /** The tax office's code for a VAT-free or 0% product. */
  taxCode: z.string().trim().max(20).nullable(),
});

export type EbarimtTaxRule = z.infer<typeof EbarimtTaxRule>;

const percent = (column: z.ZodNumber) => column.min(0).max(100);
const code = (max: number) => (column: z.ZodString) => column.trim().max(max);

export const EbarimtSettings = createSelectSchema(ebarimtSettings, {
  rules: z.array(EbarimtTaxRule),
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  /** `disabled`: no receipts are sent; the settings stay. */
  status: true,
  posApiUrl: true,
  companyName: true,
  merchantTin: true,
  posNo: true,
  districtCode: true,
  branchNo: true,
  /** 0: the merchant doesn't pay VAT. */
  vatPercent: true,
  cityTaxPercent: true,
  classificationCode: true,
  /** The plugins whose paid invoices get receipts (`core` for core's own). */
  plugins: true,
  rules: true,
  createdAt: true,
  updatedAt: true,
});

export type EbarimtSettings = z.infer<typeof EbarimtSettings>;

const EbarimtSettingsInput = createUpdateSchema(ebarimtSettings, {
  posApiUrl: (url) => url.trim().min(1).max(500),
  companyName: (name) => name.trim().min(1).max(200),
  merchantTin: (tin) => tin.trim().regex(/^\d{11,14}$/, '11 to 14 digits'),
  posNo: code(20),
  districtCode: (district) => district.trim().regex(/^\d{4}$/, '4 digits'),
  branchNo: code(20),
  vatPercent: percent,
  cityTaxPercent: percent,
  classificationCode: code(20),
  plugins: z.array(z.string().min(1).max(40)).max(50).optional(),
  rules: z.array(EbarimtTaxRule).max(100).optional(),
})
  .pick({
    status: true,
    posApiUrl: true,
    companyName: true,
    merchantTin: true,
    posNo: true,
    districtCode: true,
    branchNo: true,
    vatPercent: true,
    cityTaxPercent: true,
    classificationCode: true,
    plugins: true,
    rules: true,
  })
  .required({ posApiUrl: true, companyName: true, merchantTin: true, districtCode: true });

const int = () => z.int();

export const EbarimtReceipt = createSelectSchema(ebarimtReceipts, {
  id: Id,
  invoiceId: Id,
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
    invoiceId: true,
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
  .extend(
    createSelectSchema(paymentInvoices).pick({
      source: true,
      referenceType: true,
      referenceId: true,
      currency: true,
    }).shape,
  );

export type EbarimtReceipt = z.infer<typeof EbarimtReceipt>;

const { COMPANY_NOT_FOUND, EBARIMT_NOT_SET_UP, INVALID_URL, TAX_OFFICE_UNAVAILABLE } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  COMPANY_NOT_FOUND,
  EBARIMT_NOT_SET_UP,
  INVALID_URL,
  TAX_OFFICE_UNAVAILABLE,
});

const InvoiceRef = z.object({ invoiceId: Id });

/**
 * eBarimt, Mongolia's tax receipts, as an integration (Settings ›
 * Integrations). When it is active, every paid invoice of the plugins it
 * names gets a receipt from the merchant's PosAPI, built from the invoice's
 * lines and its `taxBuyer`. A refund returns the receipt, or replaces it with
 * one for what is left. Receipts are sent in the background; a failed one is
 * kept with its error and sent again by `sync`.
 */
export const ebarimtContract = {
  settings: base
    .route({
      method: 'GET',
      path: '/ebarimt/settings',
      summary: 'The organisation’s eBarimt settings; null when it is not set up',
    })
    .output(EbarimtSettings.nullable()),
  saveSettings: base
    .route({
      method: 'PUT',
      path: '/ebarimt/settings',
      summary:
        'Set up eBarimt or change its settings. 400 INVALID_URL for a PosAPI address core may not call',
    })
    .input(EbarimtSettingsInput)
    .output(EbarimtSettings),
  removeSettings: base
    .route({
      method: 'DELETE',
      path: '/ebarimt/settings',
      summary: 'Remove eBarimt; issued receipts stay',
    })
    .output(z.object({ ok: z.literal(true) })),
  testConnection: base
    .route({
      method: 'POST',
      path: '/ebarimt/settings/test',
      summary: 'Ask a PosAPI for its state, before saving it. 400 INVALID_URL',
    })
    .input(z.object({ posApiUrl: z.string().trim().min(1).max(500) }))
    .output(
      z.object({
        ok: z.boolean(),
        /** Why it failed: unreachable, or what PosAPI said. */
        error: z.string().nullable(),
        /** PosAPI's own answer (its version, merchants and last sync). */
        info: z.record(z.string(), z.unknown()).nullable(),
      }),
    ),
  receipts: base
    .route({
      method: 'GET',
      path: '/ebarimt/receipts',
      summary: 'Receipts, newest first; a plugin sees its own invoices’ only',
    })
    .input(
      CursorQuery.extend({
        invoiceId: Id.optional(),
        source: z.string().max(40).optional(),
        referenceId: z.string().max(100).optional(),
        status: EbarimtReceiptStatus.optional(),
      }),
    )
    .output(cursorPageOf(EbarimtReceipt)),
  sync: base
    .route({
      method: 'POST',
      path: '/ebarimt/invoices/{invoiceId}/sync',
      summary:
        'Bring the invoice’s receipt up to date in the background: send a failed one again, issue a missing one. 409 EBARIMT_NOT_SET_UP',
    })
    .input(InvoiceRef)
    .output(z.object({ ok: z.literal(true) })),
  setBuyer: base
    .route({
      method: 'PUT',
      path: '/ebarimt/invoices/{invoiceId}/buyer',
      summary:
        'Change who the invoice’s receipt is for (an issued one is replaced), or whether it gets one (`taxReceipt: false` returns an issued one). 404 COMPANY_NOT_FOUND, 503 TAX_OFFICE_UNAVAILABLE, 409 EBARIMT_NOT_SET_UP',
    })
    .input(InvoiceRef.extend({ taxBuyer: TaxBuyer.optional(), taxReceipt: z.boolean().optional() }))
    .output(z.object({ ok: z.literal(true) })),
  findCompany: base
    .route({
      method: 'GET',
      path: '/ebarimt/companies/{no}',
      summary:
        'A company’s tax number and name from its registration or tax number. 404 COMPANY_NOT_FOUND, 503 TAX_OFFICE_UNAVAILABLE',
    })
    .input(z.object({ no: z.string().trim().min(7).max(14) }))
    .output(z.object({ tin: z.string(), name: z.string().nullable() })),
};
