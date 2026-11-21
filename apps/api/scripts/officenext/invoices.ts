/**
 * Old invoices (`payment_invoices`, and `invoices` from the older payment plugin) →
 * `core_payment_invoices`, as history. Amounts move to the smallest unit; an invoice paid through
 * a transaction (`payment_transactions`, one per paid invoice) takes its gateway, amount and time
 * from it. The gateway is the one it was paid through, else the first one it offered that core
 * has; with none, the invoice is a payment taken outside a gateway (`transfer`: QPay's QR is paid
 * from a bank app). Old invoices still pending can't be paid any more, so they come in expired.
 * None asks for a tax receipt: old erxes issued its receipts itself (`receipts.ts`).
 */
import type { INVOICE_STATUSES } from '@erxes/core-db/enums';
import { inOrder } from '~/lib/sequence';
import { redact } from './auditLogs';
import { resolve } from './idMap';
import { existing, idSet, insert, readAll, type Run, unit } from './run';
import {
  amount,
  createdOf,
  ids,
  minor,
  optionalId,
  plain,
  readOr,
  record,
  text,
  texts,
  when,
} from './values';
import { z } from 'zod';

export const OldInvoice = record({
  amount,
  status: text,
  currency: text,
  description: text,
  invoiceNumber: text,
  identifier: text,
  contentType: text,
  contentTypeId: optionalId,
  customerId: optionalId,
  customerType: text,
  paymentIds: ids,
  selectedPaymentId: optionalId,
  paymentKinds: texts,
  paymentKind: text,
  phone: text,
  email: text,
  redirectUri: text,
  data: z.unknown().optional(),
  resolvedAt: when,
  createdAt: when,
  updatedAt: when,
});

type OldInvoice = NonNullable<ReturnType<typeof OldInvoice.parse>>;

export const Transaction = record({
  invoiceId: optionalId,
  paymentId: optionalId,
  amount,
  status: text,
  createdAt: when,
  updatedAt: when,
});

type Transaction = NonNullable<ReturnType<typeof Transaction.parse>>;

type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/** Old statuses → core's. Pending ones were never paid and can't be now. */
const STATUSES: Record<string, InvoiceStatus> = {
  paid: 'paid',
  pending: 'expired',
  expired: 'expired',
  cancelled: 'cancelled',
  failed: 'failed',
  rejected: 'failed',
  refunded: 'refunded',
};

/** What an invoice was for: old content types → the plugin and its record type. */
const REFERENCES: Record<string, [string, string]> = {
  deal: ['sales', 'deal'],
  'sales:deal': ['sales', 'deal'],
  'sales:deals': ['sales', 'deal'],
  'sales:order': ['sales', 'order'],
  'event:ticket': ['event', 'ticket'],
  'inbox:conversations': ['frontline', 'conversation'],
};

/** The plugin and record an invoice was for; one for nothing is core's own. */
export const referenceOf = (contentType: string | null, contentId: string | null, id: string) => {
  const [prefix = 'core', type = 'invoice'] = contentType?.split(':') ?? [];
  const [source, referenceType] = REFERENCES[contentType ?? ''] ?? [prefix, type];

  return { source, referenceType, referenceId: contentId ?? id };
};

interface Lookups {
  gateways: Set<string>;
  paid: Map<string, Transaction>;
  customers: Set<string>;
}

/** The gateway the invoice went through: its transaction's, else the first core has. */
const gatewayOf = (invoice: OldInvoice, paidBy: Transaction | undefined, gateways: Set<string>) => {
  if (paidBy) return paidBy.paymentId && gateways.has(paidBy.paymentId) ? paidBy.paymentId : null;

  const offered = [invoice.selectedPaymentId, ...invoice.paymentIds].flatMap((id) => id ?? []);

  return offered.find((id) => gateways.has(id)) ?? null;
};

/** The core row, or why the invoice has none. */
export const invoiceRow = (
  invoice: OldInvoice,
  lookups: Lookups,
): { row: unknown[] } | { skip: string } => {
  const status = STATUSES[invoice.status ?? ''];
  const total = minor(invoice.amount);

  if (!status) return { skip: `status ${invoice.status ?? '(none)'} has no core match` };

  if (!total || total <= 0) return { skip: 'no amount' };

  const paidBy = lookups.paid.get(invoice.id);
  const gateway = gatewayOf(invoice, paidBy, lookups.gateways);
  const at = createdOf(invoice.id, invoice.createdAt, invoice.updatedAt);
  const settled = invoice.resolvedAt ?? paidBy?.updatedAt ?? paidBy?.createdAt ?? at;
  const paid = status === 'paid' || status === 'refunded';
  const paidAmount = paid ? (minor(paidBy?.amount ?? null) ?? total) : null;
  const reference = referenceOf(invoice.contentType, invoice.contentTypeId, invoice.id);
  const customer = invoice.customerId && resolve('customer', invoice.customerId);
  const number = invoice.invoiceNumber ?? invoice.identifier;

  const metadata = Object.fromEntries(
    Object.entries({
      importedFrom: 'erxes 3 payments',
      invoiceNumber: number,
      gateways: invoice.paymentKinds.length ? invoice.paymentKinds : invoice.paymentKind,
      customerId: customer && lookups.customers.has(customer) ? customer : null,
      phone: invoice.phone,
      email: invoice.email,
      redirectUri: invoice.redirectUri,
      data: redact(plain(invoice.data ?? null)),
    }).filter(([, value]) => value !== null && value !== undefined),
  );

  return {
    row: [
      invoice.id,
      gateway,
      gateway ? 'gateway' : 'transfer',
      reference.source,
      reference.referenceType,
      reference.referenceId,
      total,
      invoice.currency ?? 'MNT',
      invoice.description ?? (number ? `Invoice ${number}` : 'Invoice'),
      status,
      JSON.stringify(metadata),
      false,
      paidAmount,
      status === 'refunded' ? paidAmount : 0,
      settled,
      paid ? settled : null,
      `officenext:invoice:${invoice.id}`,
      at,
      invoice.updatedAt ?? at,
    ],
  };
};

const COLUMNS = [
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
  'tax_receipt',
  'paid_amount',
  'refunded_amount',
  'expires_at',
  'paid_at',
  'dedupe_key',
  'created_at',
  'updated_at',
];

const TRANSACTIONS = 'payment_transactions';

/** The paid transaction of each invoice; tries that weren't paid are counted. */
const paidTransactions = async (run: Run) => {
  const transactions = (await readAll(run, TRANSACTIONS)).flatMap(
    (raw) => readOr(Transaction, raw) ?? [],
  );

  const paid = transactions.filter((each) => each.invoiceId && each.status === 'paid');

  run.report.of(TRANSACTIONS, 'core_payment_invoices (paid amount, time and gateway)');
  run.report.seen(TRANSACTIONS, transactions.length);

  if (transactions.length > paid.length) {
    run.report.skip(
      TRANSACTIONS,
      'not paid: core keeps an invoice, not its tries',
      '',
      transactions.length - paid.length,
    );
  }

  return new Map(paid.map((each) => [each.invoiceId ?? '', each]));
};

/** A paid transaction is copied with its invoice: when the invoice was written now. */
const countFolded = (
  run: Run,
  paid: Map<string, Transaction>,
  before: Set<string>,
  written: Set<string>,
) => {
  const invoices = [...paid.keys()];
  const now = invoices.filter((id) => written.has(id) && !before.has(id));
  const earlier = invoices.filter((id) => before.has(id));
  const out = invoices.length - now.length - earlier.length;

  run.report.copied(TRANSACTIONS, now.length);

  if (earlier.length)
    run.report.skip(TRANSACTIONS, 'already in core (an earlier run)', '', earlier.length);

  if (out) run.report.skip(TRANSACTIONS, 'its invoice stayed out', '', out);
};

/** Old invoices of both payment plugins. */
export const importInvoices = async (run: Run) => {
  const gateways = await idSet(run, 'core_payment_gateways');
  const paid = await paidTransactions(run);
  const before = await existing(run, 'core_payment_invoices', [...paid.keys()]);
  const written = new Set<string>();

  await inOrder(['payment_invoices', 'invoices'], async (name) => {
    const invoices = (await readAll(run, name)).flatMap((raw) => readOr(OldInvoice, raw) ?? []);

    const customers = await existing(
      run,
      'core_customers',
      invoices.flatMap((invoice) =>
        invoice.customerId ? [resolve('customer', invoice.customerId)] : [],
      ),
    );

    run.report.of(name, 'core_payment_invoices');
    run.report.seen(name, invoices.length);

    const kept = invoices.flatMap((invoice) => {
      const placed = invoiceRow(invoice, { gateways, paid, customers });

      if ('skip' in placed) run.report.skip(name, placed.skip, invoice.id);
      else if (invoice.status === 'pending') {
        run.report.note(name, 'pending: came in expired', invoice.id);
      }

      return 'row' in placed ? [{ id: invoice.id, row: placed.row }] : [];
    });

    await unit(run, () =>
      insert(run, {
        collection: name,
        table: 'core_payment_invoices',
        columns: COLUMNS,
        rows: kept.map((each) => each.row),
        keys: kept.map((each) => each.id),
      }),
    );

    for (const each of kept) written.add(each.id);
  });

  countFolded(run, paid, before, written);
};
