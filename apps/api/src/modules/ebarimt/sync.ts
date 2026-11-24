import { type Db, ebarimtReceipts, newId, withOrg } from '@erxes/core-db';
import { and, eq, lt, ne, sql } from 'drizzle-orm';
import { z } from 'zod';
import { ORPCError } from '@orpc/server';
import { oneRow } from '~/lib/rows';
import { logger } from '~/logger';
import { publishCoreEvents } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { type Buyer, type BuiltReceipt, buildReceipt, linesFor } from './build';
import {
  activeReceipt,
  configOf,
  configOff,
  keptAmount,
  readForSync,
  type ReceiptRow,
} from './plan';
import { deleteReceipt, findCompany, putReceipt } from './posapi';

const log = logger.child({ component: 'ebarimt' });

/** A receipt pending this long was cut off mid-call: it no longer holds the invoice. */
const STUCK = sql`now() - interval '5 minutes'`;

/** Thrown while another sync holds the invoice: the job runs again later. */
class InvoiceBusy extends Error {
  constructor() {
    super('another eBarimt sync holds this invoice');
  }
}

type Plan =
  | { kind: 'return'; previous: ReceiptRow }
  | { kind: 'put'; previous: ReceiptRow | null; buyer: Buyer; built: BuiltReceipt }
  | { kind: 'failed'; previous: ReceiptRow | null; buyer: Buyer; error: string };

const person = (consumerNo: string | null): Buyer => ({
  type: 'B2C_RECEIPT',
  customerTin: null,
  customerName: null,
  consumerNo,
});

/** Who the receipt is for: a company the tax office knows, or a person. Calls out. */
const buyerOf = async (taxBuyer: { companyNo?: string; consumerNo?: string } | null) => {
  if (!taxBuyer?.companyNo) return person(taxBuyer?.consumerNo ?? null);

  const company = await findCompany(taxBuyer.companyNo);

  return {
    type: 'B2B_RECEIPT' as const,
    customerTin: company.tin,
    customerName: company.name,
    consumerNo: null,
  };
};

const sameBuyer = (receipt: ReceiptRow, buyer: Buyer) =>
  receipt.buyerType === buyer.type &&
  receipt.customerTin === buyer.customerTin &&
  receipt.consumerNo === buyer.consumerNo;

type Read = NonNullable<Awaited<ReturnType<typeof readForSync>>>;

/** What the invoice's receipt should become; null: it is right as it is. Calls out (the tax office). */
const planFor = async (read: Read) => {
  const { invoice, settings, active } = read;
  // An invoice that gets no receipt keeps nothing to issue one for: an issued one is returned.
  const kept = invoice.taxReceipt ? keptAmount(invoice) : 0;

  if (kept <= 0) return active ? ({ kind: 'return', previous: active } satisfies Plan) : null;

  let buyer: Buyer;

  try {
    buyer = await buyerOf(invoice.taxBuyer);
  } catch (error) {
    if (!(error instanceof ORPCError && error.code === 'COMPANY_NOT_FOUND')) throw error;

    return {
      kind: 'failed',
      previous: active,
      buyer: person(null),
      error: error.message,
    } satisfies Plan;
  }

  const built = buildReceipt({
    lines: linesFor(invoice, kept),
    settings,
    products: read.products,
    buyer,
    paidAt: invoice.paidAt ?? invoice.createdAt,
    inactiveId: active?.billId ?? null,
    method: invoice.method,
  });

  if (!built) return active ? ({ kind: 'return', previous: active } satisfies Plan) : null;

  if (active && active.totalAmount === built.totals.totalAmount && sameBuyer(active, buyer)) {
    return null;
  }

  return { kind: 'put', previous: active, buyer, built } satisfies Plan;
};

const buyerColumns = (buyer: Buyer) => ({
  buyerType: buyer.type,
  customerTin: buyer.customerTin,
  customerName: buyer.customerName,
  consumerNo: buyer.consumerNo,
});

/** What the receipt row starts as, for the plan. */
const rowOf = (plan: Plan) => {
  if (plan.kind === 'return') {
    const { previous } = plan;

    return {
      kind: 'return' as const,
      buyerType: previous.buyerType,
      customerTin: previous.customerTin,
      customerName: previous.customerName,
      consumerNo: previous.consumerNo,
      totalAmount: previous.totalAmount,
      totalVat: previous.totalVat,
      totalCityTax: previous.totalCityTax,
      request: { id: previous.billId, date: previous.billDate },
    };
  }

  return {
    kind: 'put' as const,
    ...buyerColumns(plan.buyer),
    ...(plan.kind === 'put' && { ...plan.built.totals, request: plan.built.request }),
  };
};

/**
 * Takes the invoice for this sync: a pending receipt row, one per invoice
 * (a unique index). A row left pending by a crash frees the invoice after
 * a while. Throws InvoiceBusy when another sync holds it or the issued
 * receipt changed since it was read. With `refused`, the row is stored as
 * failed with it instead, and nothing is sent.
 */
const claim = async (
  tx: Db,
  invoiceId: string,
  settingsId: string,
  plan: Plan,
  refused: string | null,
) => {
  await tx
    .update(ebarimtReceipts)
    .set({ status: 'failed', error: 'Interrupted before PosAPI answered', updatedAt: sql`now()` })
    .where(
      and(
        eq(ebarimtReceipts.invoiceId, invoiceId),
        eq(ebarimtReceipts.status, 'pending'),
        lt(ebarimtReceipts.updatedAt, STUCK),
      ),
    );

  if ((await activeReceipt(tx, invoiceId))?.id !== (plan.previous?.id ?? undefined)) {
    throw new InvoiceBusy();
  }

  const [row] = await tx
    .insert(ebarimtReceipts)
    .values({
      id: newId(),
      invoiceId,
      settingsId,
      previousId: plan.previous?.id ?? null,
      ...rowOf(plan),
      ...(refused !== null && { status: 'failed' as const, error: refused }),
    })
    .onConflictDoNothing()
    .returning();

  if (!row) throw new InvoiceBusy();

  // Earlier failed tries at the same change give way to this one.
  await tx
    .delete(ebarimtReceipts)
    .where(
      and(
        eq(ebarimtReceipts.invoiceId, invoiceId),
        eq(ebarimtReceipts.kind, row.kind),
        eq(ebarimtReceipts.status, 'failed'),
        sql`${ebarimtReceipts.previousId} is not distinct from ${row.previousId}`,
        ne(ebarimtReceipts.id, row.id),
      ),
    );

  return row;
};

/** Why the receipt is kept as failed without asking PosAPI; null: it is sent. */
const refusalOf = (read: Pick<Read, 'off' | 'settings'>, plan: Plan) => {
  if (plan.kind === 'failed') return plan.error;

  return read.off ? configOff(read.settings) : null;
};

/** Sends the claimed receipt to PosAPI. */
const send = async (posApiUrl: string, plan: Plan) => {
  if (plan.kind === 'return') {
    const { billId, billDate } = plan.previous;

    const error =
      billId && billDate ? await deleteReceipt(posApiUrl, { id: billId, date: billDate }) : null;

    return error
      ? { ok: false as const, error, response: null }
      : { ok: true as const, response: null };
  }

  if (plan.kind === 'failed') return null;

  return putReceipt(posApiUrl, plan.built.request);
};

/** Records PosAPI's answer; a success makes the receipt it replaced or returned inactive. */
const record = async (
  tx: Db,
  invoice: { referenceType: string; referenceId: string },
  receipt: ReceiptRow,
  answer: NonNullable<Awaited<ReturnType<typeof send>>>,
) => {
  const issued = answer.ok && 'billId' in answer ? answer : null;

  const row = oneRow(
    await tx
      .update(ebarimtReceipts)
      .set({
        status: answer.ok ? 'success' : 'failed',
        error: answer.ok ? null : answer.error.slice(0, 500),
        response: answer.response,
        billId: issued?.billId,
        billDate: issued?.billDate,
        lottery: issued?.lottery,
        qrData: issued?.qrData,
        updatedAt: sql`now()`,
      })
      .where(eq(ebarimtReceipts.id, receipt.id))
      .returning(),
  );

  if (answer.ok && receipt.previousId) {
    await tx
      .update(ebarimtReceipts)
      .set({ inactiveAt: sql`now()`, updatedAt: sql`now()` })
      .where(eq(ebarimtReceipts.id, receipt.previousId));
  }

  if (answer.ok && receipt.kind === 'return') {
    await tx
      .update(ebarimtReceipts)
      .set({ inactiveAt: sql`now()` })
      .where(eq(ebarimtReceipts.id, receipt.id));
  }

  if (issued) {
    await publishCoreEvents(tx, {
      type: 'core.ebarimt.receipt_issued',
      entityType: 'ebarimt_receipt',
      entityId: row.id,
      payload: {
        receiptId: row.id,
        invoiceId: row.invoiceId,
        billId: row.billId,
        billDate: row.billDate,
        lottery: row.lottery,
        buyerType: row.buyerType,
        customerTin: row.customerTin,
        customerName: row.customerName,
        totalAmount: row.totalAmount,
        totalVat: row.totalVat,
        totalCityTax: row.totalCityTax,
        previousId: row.previousId,
        referenceType: invoice.referenceType,
        referenceId: invoice.referenceId,
      },
    });
  }

  return row;
};

/**
 * Brings an invoice's receipt in line with the invoice: issues one for a paid
 * invoice, replaces it after a partial refund or a new buyer, returns it once
 * all is refunded. PosAPI is called between short scopes. Call outside any scope.
 */
const syncReceipt = async (orgId: string, invoiceId: string) => {
  const read = await withOrg(orgId, (tx) => readForSync(tx, invoiceId));

  if (!read) return null;

  const plan = await planFor(read);

  if (!plan) return null;

  const refused = refusalOf(read, plan);

  const receipt = await withOrg(orgId, (tx) =>
    claim(tx, invoiceId, read.settings.id, plan, refused),
  );

  if (refused !== null) return { receipt, retry: false };

  const answer = await send(read.settings.posApiUrl, plan);

  if (!answer) return { receipt, retry: false };

  const recorded = await withOrg(orgId, (tx) => record(tx, read.invoice, receipt, answer));

  log[answer.ok ? 'info' : 'warn'](
    { orgId, invoiceId, receiptId: receipt.id, kind: receipt.kind, error: recorded.error },
    answer.ok ? 'eBarimt receipt sent' : 'PosAPI refused an eBarimt receipt',
  );

  // No answer at all (unreachable, timed out): worth another try. A refusal waits for a fix.
  return { receipt: recorded, retry: !answer.ok && answer.response === null };
};

/** Syncs an invoice's receipt; tried again while another sync holds the invoice or PosAPI is down. */
export const ebarimtSyncJob = defineJob({
  queue: 'ebarimt.sync',
  retry: { attempts: 6, delay: 30, maxDelay: 1800 },
  payload: z.object({ invoiceId: z.string() }),
  async handle(job) {
    const synced = await syncReceipt(job.orgId, job.payload.invoiceId);

    if (synced?.retry && !job.lastAttempt) {
      throw new Error(
        `PosAPI did not answer for receipt ${synced.receipt.id}: ${synced.receipt.error}`,
      );
    }
  },
});

/**
 * Queues a sync of the invoice's receipt, in the caller's transaction, when
 * eBarimt is set up: the sync picks the invoice's config, and keeps a receipt it can't send
 * because that config is off as failed. Each change queues its own sync; they run one at a time
 * per invoice (the pending receipt).
 */
export const queueReceiptSync = async (tx: Db, invoice: { orgId: string; id: string }) => {
  if (!(await configOf(tx))) return;

  await ebarimtSyncJob.enqueue(tx, { orgId: invoice.orgId, payload: { invoiceId: invoice.id } });
};
