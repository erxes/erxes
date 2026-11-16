import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Payments taken outside a gateway: cash, a card terminal, a bank transfer. */
describe('recorded payments', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const cash = {
    method: 'cash' as const,
    amount: 50_000,
    description: 'Order #r1',
    referenceType: 'order',
    referenceId: 'r1',
    dedupeKey: 'order-r1',
  };

  it('records a payment as paid without a gateway and announces it', async () => {
    const invoice = await t.hr().payments.recordPayment(cash);

    expect(invoice).toMatchObject({
      status: 'paid',
      method: 'cash',
      gatewayId: null,
      gatewayKind: null,
      source: 'hr',
      paidAmount: 50_000,
    });
    // Retry-safe.
    expect((await t.hr().payments.recordPayment(cash)).id).toBe(invoice.id);

    const events = await t.owner().events.list({ type: 'core.payment.paid' });

    expect(events.data).toHaveLength(1);
    expect(events.data[0]?.payload).toMatchObject({
      invoiceId: invoice.id,
      method: 'cash',
      paidAmount: 50_000,
      gateway: null,
    });
    expect((await t.owner().payments.invoices({})).data.map((row) => row.id)).toContain(invoice.id);
    // The other organisation sees none of it.
    expect((await t.other().payments.invoices({})).data).toEqual([]);
  });

  it('is refused to members without payments.manage', async () => {
    await expect(
      t.member().payments.recordPayment({ ...cash, dedupeKey: 'member' }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('refunds only as money given back outside erxes, and has nothing to cancel', async () => {
    const invoice = await t
      .owner()
      .payments.recordPayment({ ...cash, method: 'transfer', referenceId: 'r2', dedupeKey: 'r2' });

    expect(invoice.refundable).toMatchObject({ amount: 50_000, gateway: 'none' });
    await expect(
      t.owner().payments.refund({ id: invoice.id, amount: 10_000, reason: 'Damaged' }),
    ).rejects.toMatchObject({ code: 'PARTIAL_NOT_SUPPORTED' });
    await expect(t.owner().payments.cancelInvoice({ id: invoice.id })).rejects.toMatchObject({
      code: 'NOT_PENDING',
    });

    const { refund, invoice: after } = await t
      .owner()
      .payments.refund({ id: invoice.id, amount: 10_000, reason: 'Damaged', manual: true });

    expect(refund).toMatchObject({ status: 'succeeded', method: 'manual' });
    expect(after).toMatchObject({ status: 'paid', refundedAmount: 10_000 });
  });
});
