import { paymentInvoices } from '@erxes/core-db';
import { eq, inArray, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { callbackSignature } from '~/modules/payments/invoiceState';
import { adminDb, useTestDatabase } from './db';
import { makeDue, settle } from './settle';
import { useTwoOrgs } from './support';

const order = (id: string) => ({
  amount: 5000,
  description: `Order #${id}`,
  referenceType: 'order',
  referenceId: id,
});

/** The test gateway offering two candidate payments, as two matching transfers on a statement. */
const offered = JSON.stringify({ testPaid: true, testPaymentIds: ['tr-1', 'tr-2'] });

const byText = (a: string, b: string) => a.localeCompare(b);

describe('payments under concurrent calls', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('stores one invoice when a plugin retries with the same dedupe key at once', async () => {
    await t.owner().integrations.connect({ key: 'test', name: 'Test', keys: {} });

    const input = { ...order('o1'), dedupeKey: 'order-o1' };

    const invoices = await Promise.all(
      Array.from({ length: 5 }, () => t.hr().payments.createInvoice(input)),
    );

    expect(new Set(invoices.map((invoice) => invoice.id)).size).toBe(1);

    const listed = await t.owner().payments.invoices({ referenceId: 'o1' });

    expect(listed.data).toHaveLength(1);
  });

  it('marks an invoice paid once when callbacks and reads check it together', async () => {
    const { id } = await t.hr().payments.createInvoice(order('o2'));

    // The payer pays at the test gateway; core has not asked it yet.
    await adminDb()
      .update(paymentInvoices)
      .set({ payment: sql`${paymentInvoices.payment} || '{"testPaid": true}'::jsonb` })
      .where(eq(paymentInvoices.id, id));

    const callback = t.url(`/core/v1/payments/callback/${id}/${callbackSignature(id)}`);

    await Promise.all([
      ...Array.from({ length: 3 }, () => fetch(callback, { method: 'POST' })),
      ...Array.from({ length: 3 }, () => t.hr().payments.getInvoice({ id })),
    ]);

    expect((await t.hr().payments.getInvoice({ id })).status).toBe('paid');

    const events = await t.owner().events.list({ type: 'core.payment.paid' });

    expect(events.data.filter((event) => event.entityId === id)).toHaveLength(1);
  });

  it('settles one invoice only with a gateway payment, however often it is offered', async () => {
    const first = await t.hr().payments.createInvoice(order('o4'));
    const second = await t.hr().payments.createInvoice(order('o5'));

    // The gateway answers for the second invoice with the payment it settled the first with
    // (a payer token replayed to another order).
    const [{ gatewayInvoiceId } = { gatewayInvoiceId: null }] = await adminDb()
      .select({ gatewayInvoiceId: paymentInvoices.gatewayInvoiceId })
      .from(paymentInvoices)
      .where(eq(paymentInvoices.id, first.id));

    await adminDb()
      .update(paymentInvoices)
      .set({ gatewayInvoiceId })
      .where(eq(paymentInvoices.id, second.id));

    expect(await t.owner().payments.payTestInvoice({ id: first.id })).toMatchObject({
      status: 'paid',
    });
    expect(await t.owner().payments.payTestInvoice({ id: second.id })).toMatchObject({
      status: 'pending',
    });
  });

  it('settles invoices that match the same transfers with a different one each', async () => {
    const ids = await Promise.all(
      ['o6', 'o7', 'o8'].map(async (id) => (await t.hr().payments.createInvoice(order(id))).id),
    );

    // Two transfers on the statement match all three invoices (same amount and reference).
    await adminDb()
      .update(paymentInvoices)
      .set({ payment: sql`${paymentInvoices.payment} || ${offered}::jsonb` })
      .where(inArray(paymentInvoices.id, ids));

    const checked = await Promise.all(ids.map((id) => t.owner().payments.getInvoice({ id })));

    const settled = await adminDb()
      .select({ status: paymentInvoices.status, paymentId: paymentInvoices.gatewayPaymentId })
      .from(paymentInvoices)
      .where(inArray(paymentInvoices.id, ids));

    expect(checked.map((invoice) => invoice.status).toSorted(byText)).toEqual([
      'paid',
      'paid',
      'pending',
    ]);
    expect(
      settled
        .flatMap((row) => (row.status === 'paid' ? [row.paymentId ?? ''] : []))
        .toSorted(byText),
    ).toEqual(['tr-1', 'tr-2']);
  });

  it('keeps checking an invoice in the background while its gateway is unreachable', async () => {
    const { id } = await t.hr().payments.createInvoice(order('o3'));

    const setPayment = (patch: Record<string, boolean>) =>
      adminDb()
        .update(paymentInvoices)
        .set({ payment: sql`${paymentInvoices.payment} || ${JSON.stringify(patch)}::jsonb` })
        .where(eq(paymentInvoices.id, id));

    await setPayment({ testCheckFails: true });
    await makeDue();
    await settle();

    // The gateway answers again, and the payer has paid meanwhile.
    await setPayment({ testCheckFails: false, testPaid: true });
    await makeDue();
    await settle();

    const [stored] = await adminDb()
      .select({ status: paymentInvoices.status })
      .from(paymentInvoices)
      .where(eq(paymentInvoices.id, id));

    expect(stored?.status).toBe('paid');
  });
});
