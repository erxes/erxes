import {
  BANK_KINDS,
  BANK_TRANSFER_STATUSES,
  BANK_TRANSFER_TYPES,
  TAX_INQUIRY_KINDS,
} from '@erxes/core-db/enums';
import { INTEGRATION_CONNECTION_STATUSES } from '@erxes/core-db/integrationEnums';
import { bankTransfers } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

const field = () => z.string().trim().min(1).max(200);
const secret = () => z.string().trim().min(1).max(2000);
const digits = () => z.string().trim().regex(/^\d+$/, 'a number').max(40);

export const BankKind = z.enum(BANK_KINDS);

export type BankKind = z.infer<typeof BankKind>;

/**
 * A bank connection (Settings › Integrations › Banks), for picking one: its
 * bank and whether its keys let it send money (Khan Bank's transaction
 * password, Golomt's transfer secret). Never its keys.
 */
export const BankConnection = z.object({
  id: Id,
  /** Its integration: `khanbank-cgw`, `golomt-cgw` or `tdb-cgw`. */
  key: z.string(),
  kind: BankKind,
  name: z.string(),
  status: z.enum(INTEGRATION_CONNECTION_STATUSES),
  transfers: z.boolean(),
});

export type BankConnection = z.infer<typeof BankConnection>;

/** An account at the bank. Amounts are integers in the currency's smallest unit; null: the bank didn't say. */
export const BankAccount = z.object({
  number: z.string(),
  iban: z.string().nullable(),
  name: z.string().nullable(),
  currency: z.string(),
  balance: z.number().nullable(),
  available: z.number().nullable(),
  hold: z.number().nullable(),
  status: z.string().nullable(),
});

export type BankAccount = z.infer<typeof BankAccount>;

/** One statement line: money in is positive, out negative. */
export const StatementLine = z.object({
  id: z.string(),
  date: z.string().nullable(),
  amount: z.number(),
  balance: z.number().nullable(),
  description: z.string(),
  counterparty: z
    .object({
      account: z.string().nullable(),
      name: z.string().nullable(),
      bank: z.string().nullable(),
    })
    .nullable(),
});

export const Statement = z.object({
  lines: z.array(StatementLine),
  openingBalance: z.number().nullable(),
  closingBalance: z.number().nullable(),
  more: z.boolean(),
});

export type Statement = z.infer<typeof Statement>;

const Day = z.iso.date();

export const StatementQuery = z
  .object({
    id: Id,
    account: digits(),
    from: Day,
    to: Day,
    page: z.coerce.number().int().min(1).max(500).default(1),
  })
  .refine((query) => query.from <= query.to, { message: 'from is after to', path: ['from'] });

/**
 * Money to send. `reference` is the caller's, unique per transfer: sending
 * the same one again is refused, never sent twice. Khan Bank asks the
 * internet bank user who sends it (`sender`), each time; it is never kept.
 */
export const TransferInput = z
  .object({
    id: Id,
    reference: z
      .string()
      .trim()
      .regex(/^[\w-]{8,64}$/u, '8 to 64 letters, digits, - or _'),
    type: z.enum(BANK_TRANSFER_TYPES),
    fromAccount: digits(),
    toAccount: digits(),
    amount: z.int().positive().max(Number.MAX_SAFE_INTEGER),
    currency: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/u),
    description: z.string().trim().min(1).max(200),
    toAccountName: z.string().trim().min(1).max(200).optional(),
    toBank: z
      .string()
      .trim()
      .regex(/^\d{1,10}$/u)
      .optional(),
    toCurrency: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/u)
      .optional(),
    sender: z.object({ loginName: field(), password: secret() }).optional(),
  })
  .refine((input) => input.type === 'domestic' || (input.toBank && input.toAccountName), {
    message: 'A transfer to another bank needs the bank and the account name',
    path: ['toBank'],
  });

export const BankTransfer = createSelectSchema(bankTransfers, {
  id: Id,
  createdAt: isoDate,
  sentAt: () => isoDate().nullable(),
}).omit({ orgId: true });

export type BankTransfer = z.infer<typeof BankTransfer>;

export const TaxInvoice = z.object({
  invoiceNumber: z.string().nullable(),
  amount: z.number().nullable(),
  taxpayer: z.string().nullable(),
  description: z.string().nullable(),
  taxType: z.string().nullable(),
  branch: z.string().nullable(),
  period: z.string().nullable(),
});

const { BANK_REFUSED, NOT_SUPPORTED, TRANSFER_REPEATED } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  BANK_REFUSED,
  NOT_SUPPORTED,
  TRANSFER_REPEATED,
});

const ConnectionId = z.object({ id: Id });

export const banksContract = {
  connections: base
    .route({ method: 'GET', path: '/banks/connections' })
    .output(listOf(BankConnection)),
  accounts: base
    .route({ method: 'GET', path: '/banks/connections/{id}/accounts' })
    .input(ConnectionId)
    .output(listOf(BankAccount)),
  /** One account with its balance. */
  account: base
    .route({ method: 'GET', path: '/banks/connections/{id}/accounts/{account}' })
    .input(ConnectionId.extend({ account: digits() }))
    .output(BankAccount),
  statement: base
    .route({ method: 'GET', path: '/banks/connections/{id}/accounts/{account}/statement' })
    .input(StatementQuery)
    .output(Statement),
  /** Sends money, once per `reference`, and keeps the transfer whatever the bank answers. */
  transfer: base
    .route({ method: 'POST', path: '/banks/connections/{id}/transfers', successStatus: 201 })
    .input(TransferInput)
    .output(BankTransfer),
  /** Transfers sent from the organisation's accounts, newest first. */
  transfers: base
    .route({ method: 'GET', path: '/banks/transfers' })
    .input(CursorQuery)
    .output(cursorPageOf(BankTransfer)),
  /** Khan Bank: a taxpayer's TIN and name, by their registration number. */
  taxpayer: base
    .route({ method: 'GET', path: '/banks/connections/{id}/taxes/taxpayer/{registrationNumber}' })
    .input(ConnectionId.extend({ registrationNumber: field() }))
    .output(z.object({ tin: z.string().nullable(), name: z.string().nullable() })),
  /** Khan Bank: the tax invoices due, by invoice or capital (property) number. */
  taxInvoices: base
    .route({ method: 'GET', path: '/banks/connections/{id}/taxes/invoices' })
    .input(ConnectionId.extend({ by: z.enum(TAX_INQUIRY_KINDS), value: field() }))
    .output(listOf(TaxInvoice)),
};

export const BankTransferStatus = z.enum(BANK_TRANSFER_STATUSES);
