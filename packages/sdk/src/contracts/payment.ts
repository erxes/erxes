import * as z from 'zod';
import { defineContract } from './define';

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

// Invoice statuses the resolver accepts in invoiceEdit.
const InvoiceStatus = z.enum([
  'paid',
  'pending',
  'refunded',
  'failed',
  'cancelled',
  'rejected',
  'expired',
]);

const InvoiceSummary = z.object({
  _id: z.string(),
  invoiceNumber: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  customerType: z.string().nullable(),
  customerId: z.string().nullable(),
  contentType: z.string().nullable(),
  contentTypeId: z.string().nullable(),
  paymentIds: z.array(z.string()).nullable(),
  createdAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  ticketCount: z.number().nullable(),
});

const PaymentTransactionSummary = z.object({
  _id: z.string(),
  invoiceId: z.string().nullable(),
  paymentId: z.string().nullable(),
  paymentKind: z.string().nullable(),
  amount: z.number().nullable(),
  status: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const PaymentMethodSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  kind: z.string().nullable(),
  status: z.enum(['active', 'inactive']).nullable(),
});

const invoiceFilterArgs = {
  searchValue: 'String',
  kind: 'String',
  status: 'String',
  contentType: 'String',
  contentTypeId: 'String',
};

const invoiceFilter = z.object({
  searchValue: z.string().optional(),
  kind: z.string().optional(),
  status: z.string().optional(),
  contentType: z.string().optional(),
  contentTypeId: z.string().optional(),
});

const countsSummary = z.object({
  total: z.number().nullable(),
  byKind: z.record(z.string(), z.unknown()).nullable(),
  byStatus: z.record(z.string(), z.unknown()).nullable(),
});

const invoiceCreateInput = z.object({
  amount: z.number().positive(),
  phone: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
  customerId: z.string().optional(),
  customerType: z.enum(['customer', 'company', 'user']).optional(),
  contentType: z.string().optional(),
  contentTypeId: z.string().optional(),
  paymentIds: z.array(z.string().min(1)).optional(),
  currency: z.string().min(1).optional(),
});

const invoiceEditInput = z.object({
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
  status: InvoiceStatus.optional(),
});

export const paymentContract = defineContract('payment', 1, [
  {
    name: 'invoices.list',
    description:
      'Lists invoices, newest first, filtered by the optional searchValue (matches description or invoiceNumber), kind (payment kind such as qpay), status, contentType and contentTypeId. Pages with a cursor. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50, default 20. Read-only.',
    kind: 'read',
    field: 'invoices',
    args: {
      ...invoiceFilterArgs,
      limit: 'Int',
      cursor: 'String',
    },
    input: invoiceFilter
      .extend({
        limit: z.number().int().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
      .strict(),
    output: z.object({
      list: z.array(InvoiceSummary).nullable(),
      pageInfo: PageInfo.nullable(),
      totalCount: z.number().nullable(),
    }),
  },
  {
    name: 'invoices.count',
    description:
      'Counts the invoices matching the same filters as invoices.list. Returns total, plus byKind and byStatus maps with a count for each payment kind and each status. Read-only.',
    kind: 'read',
    field: 'invoicesTotalCount',
    args: invoiceFilterArgs,
    input: invoiceFilter.strict(),
    output: countsSummary,
  },
  {
    name: 'invoices.get',
    description:
      'Reads one invoice by its _id. Returns null when no invoice has that _id. Read-only.',
    kind: 'read',
    field: 'invoiceDetail',
    args: { _id: 'String!' },
    notFound: 'Invoice not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: InvoiceSummary.nullable(),
  },
  {
    name: 'invoices.create',
    description:
      'Creates an unpaid invoice for amount. currency defaults to MNT. With one paymentIds entry, it also creates a pending transaction for that payment method, and fails when that method is not found. Pass contentType and contentTypeId to link the invoice to a record. The resolver skips the permission check. Returns the new invoice.',
    kind: 'write',
    field: 'invoiceCreate',
    args: { input: 'InvoiceInput!' },
    input: z.object({ input: invoiceCreateInput }).strict(),
    output: InvoiceSummary.nullable(),
  },
  {
    name: 'invoices.edit',
    description:
      'Edits the fields you pass on one invoice: description, amount (above 0), currency and status. Pass at least one field. Setting status to paid stamps resolvedAt and sends the paid-invoice QR email. Needs paymentInvoiceEdit. Returns the updated invoice.',
    kind: 'write',
    field: 'invoiceEdit',
    args: { _id: 'String!', input: 'InvoiceEditInput!' },
    input: z
      .object({
        _id: z.string().min(1),
        input: invoiceEditInput.strict(),
      })
      .strict(),
    output: InvoiceSummary.nullable(),
  },
  {
    name: 'invoices.remove',
    description:
      'Deletes the invoices with these _ids, along with their unpaid transactions. Paid invoices are skipped without an error, so read their status first if it matters. Returns the string "removed" whether or not any invoice matched.',
    kind: 'destructive',
    field: 'invoicesRemove',
    args: { _ids: '[String]!' },
    input: z.object({ _ids: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.string(),
  },
  {
    name: 'transactions.list',
    description:
      'Lists payment transactions, filtered by the optional invoiceId, kind (payment kind) and status (pending, paid, failed and so on). Not paginated. Pass invoiceId to keep the result to one invoice. Read-only.',
    kind: 'read',
    field: 'paymentTransactions',
    args: { invoiceId: 'String', kind: 'String', status: 'String' },
    input: z
      .object({
        invoiceId: z.string().min(1).optional(),
        kind: z.string().optional(),
        status: z.string().optional(),
      })
      .strict(),
    output: z.array(PaymentTransactionSummary).nullable(),
  },
  {
    name: 'paymentMethods.list',
    description:
      'Lists payment methods, the providers an invoice can be paid with, filtered by the optional kind and status (active or inactive). Returns name, kind and status only. Read-only.',
    kind: 'read',
    field: 'payments',
    args: { kind: 'String', status: 'String' },
    input: z
      .object({
        kind: z.string().optional(),
        status: z.enum(['active', 'inactive']).optional(),
      })
      .strict(),
    output: z.array(PaymentMethodSummary).nullable(),
  },
  {
    name: 'paymentMethods.count',
    description:
      'Counts the payment methods matching kind and status. Returns total, plus byKind and byStatus maps. Read-only.',
    kind: 'read',
    field: 'paymentsTotalCount',
    args: { kind: 'String', status: 'String' },
    input: z
      .object({
        kind: z.string().optional(),
        status: z.string().optional(),
      })
      .strict(),
    output: countsSummary,
  },
]);
