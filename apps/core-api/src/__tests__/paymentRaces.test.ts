import { paymentInvoices } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { callbackSignature } from '~/modules/payments/invoiceState';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const order = (id: string) => ({
  amount: 5000,
  description: `Order #${id}`,
  referenceType: 'order',
  referenceId: id,
});

describe('payments under concurrent calls', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('stores one invoice when a plugin retries with the same dedupe key at once', async () => {
    await t.owner().payments.addGateway({ name: 'Test', config: { kind: 'test' } });

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

    const callback = t.url(`/core/v1/payments/callback/${id}?sig=${callbackSignature(id)}`);

    await Promise.all([
      ...Array.from({ length: 3 }, () => fetch(callback, { method: 'POST' })),
      ...Array.from({ length: 3 }, () => t.hr().payments.getInvoice({ id })),
    ]);

    expect((await t.hr().payments.getInvoice({ id })).status).toBe('paid');

    const events = await t.owner().events.list({ type: 'core.payment.paid' });

    expect(events.data.filter((event) => event.entityId === id)).toHaveLength(1);
  });
});
