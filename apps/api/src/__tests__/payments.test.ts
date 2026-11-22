import { paymentInvoices } from '@erxes/core-db';
import { verifyCoreEvent } from '@erxes/plugin-sdk';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { signJwt } from '~/lib/signing';
import { sha256 } from '~/lib/crypto';
import { CORE_EVENT_TYP } from '~/modules/plugins/pluginEvents';
import { adminDb, useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** An invoice for an order. */
const order = (id: string, amount = 1000) => ({
  amount,
  description: `Order #${id}`,
  referenceType: 'order',
  referenceId: id,
});

describe('payments', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('lets a plugin bill for its record, confirms payment with the gateway, and announces it', async () => {
    await expect(t.hr().payments.createInvoice(order('o1'))).rejects.toMatchObject({
      code: 'NO_GATEWAY',
    });

    const gateway = await t.owner().integrations.connect({ key: 'test', name: 'Test', keys: {} });
    const input = { ...order('o1', 150_000), dedupeKey: 'order-o1' };
    const invoice = await t.hr().payments.createInvoice(input);
    const { id } = invoice;

    expect(invoice).toMatchObject({
      status: 'pending',
      source: 'hr',
      amount: 150_000,
      payment: { qrText: `TEST:${id}` },
    });
    // Retry-safe.
    expect((await t.hr().payments.createInvoice(input)).id).toBe(id);

    // A callback that isn't ours is refused; ours only makes core ask the gateway.
    expect((await fetch(t.url(`/core/v1/payments/callback/${id}/forged`))).status).toBe(403);
    expect(await t.owner().payments.payTestInvoice({ id })).toMatchObject({ status: 'paid' });
    expect((await t.hr().payments.getInvoice({ id })).status).toBe('paid');

    const events = await t.owner().events.list({ type: 'core.payment.paid' });

    expect(events.data).toHaveLength(1);
    expect(events.data[0]?.payload).toMatchObject({
      invoiceId: id,
      source: 'hr',
      referenceType: 'order',
      referenceId: 'o1',
      amount: 150_000,
    });

    // One with invoices can't be removed.
    await expect(
      t.owner().integrations.remove({ key: 'test', id: gateway.id }),
    ).rejects.toMatchObject({ code: 'GATEWAY_IN_USE' });

    // Cancelling a pending one.
    const second = await t.hr().payments.createInvoice(order('o2'));

    expect((await t.hr().payments.cancelInvoice({ id: second.id })).status).toBe('cancelled');
    await expect(t.hr().payments.cancelInvoice({ id: second.id })).rejects.toMatchObject({
      code: 'NOT_PENDING',
    });
  });

  it('routes every invoice to the organisation’s default gateway, refunds safely, and delivers payment events to the plugin', async () => {
    const api = await pluginApi(t.url(''));

    try {
      await t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '2',
        api: { url: api.url },
        scopes: ['payments:read', 'payments:write'],
        subscriptions: ['core.payment.*'],
      });

      const second = await t
        .owner()
        .integrations.connect({ key: 'test', name: 'Test B', keys: {} });

      const third = await t.owner().integrations.connect({ key: 'test', name: 'Test C', keys: {} });

      const elsewhere = await t
        .other()
        .integrations.connect({ key: 'test', name: 'Globex', keys: {} });

      expect(await t.owner().payments.settings({})).toEqual({ defaultGatewayId: null });
      await expect(
        t.member().payments.saveSettings({ defaultGatewayId: second.id }),
      ).rejects.toMatchObject({ status: 403 });
      await expect(
        t.owner().payments.saveSettings({ defaultGatewayId: elsewhere.id }),
      ).rejects.toMatchObject({ status: 400, code: 'NO_GATEWAY' });
      expect(await t.owner().payments.saveSettings({ defaultGatewayId: second.id })).toEqual({
        defaultGatewayId: second.id,
      });
      expect(await t.other().payments.settings({})).toEqual({ defaultGatewayId: null });

      const changed = await t.owner().audit.list({ action: 'payment.default_gateway_changed' });

      expect(changed.data[0]).toMatchObject({
        targetLabel: 'Test B',
        changes: { defaultGatewayId: [null, second.id] },
      });

      const metadata = { orderId: 'o9', lines: [{ sku: 'A', qty: 2 }] };
      const invoice = await t.hr().payments.createInvoice({ ...order('o9', 100_000), metadata });
      const { id } = invoice;

      expect(invoice).toMatchObject({
        gatewayId: second.id,
        metadata,
        refundedAmount: 0,
        refundable: { amount: 0, gateway: 'partial' },
      });
      expect((await t.owner().payments.createInvoice(order('core'))).gatewayId).toBe(second.id);

      await t.owner().payments.saveSettings({ defaultGatewayId: third.id });
      await t.owner().integrations.remove({ key: 'test', id: third.id });
      expect(await t.owner().payments.settings({})).toEqual({ defaultGatewayId: null });

      const first = (await t.owner().payments.gateways({})).data.find((row) => row.name === 'Test');

      expect((await t.hr().payments.createInvoice(order('oldest'))).gatewayId).toBe(first?.id);
      expect(
        (await t.hr().payments.createInvoice({ ...order('named'), gatewayId: second.id }))
          .gatewayId,
      ).toBe(second.id);

      // Nothing to refund before it's paid.
      await expect(t.hr().payments.refund({ id, reason: 'x' })).rejects.toMatchObject({
        code: 'NOT_REFUNDABLE',
      });
      expect(await t.owner().payments.payTestInvoice({ id })).toMatchObject({
        status: 'paid',
        paidAmount: 100_000,
        refundable: { amount: 100_000 },
      });

      // Part, retry-safe; more than is left is refused.
      const partial = { id, amount: 30_000, reason: 'One item missing', dedupeKey: 'r1' };
      const part = await t.hr().payments.refund(partial);

      expect(part).toMatchObject({
        refund: { amount: 30_000, method: 'gateway', status: 'succeeded' },
        invoice: { status: 'paid', refundedAmount: 30_000 },
      });
      expect((await t.hr().payments.refund({ ...partial, reason: 'again' })).refund.id).toBe(
        part.refund.id,
      );
      await expect(
        t.hr().payments.refund({ id, amount: 80_000, reason: 'too much' }),
      ).rejects.toMatchObject({ code: 'NOT_REFUNDABLE' });

      // A refusal by the gateway is kept and changes nothing.
      await adminDb()
        .update(paymentInvoices)
        .set({ payment: { testPaid: true, testRefundFails: true } })
        .where(eq(paymentInvoices.id, id));
      expect(await t.owner().payments.refund({ id, reason: 'Customer asked' })).toMatchObject({
        refund: { status: 'failed', amount: 70_000 },
        invoice: { refundedAmount: 30_000 },
      });

      // Paid back by hand: recorded, and the rest is refunded.
      expect(
        await t.owner().payments.refund({ id, reason: 'Cash back', manual: true }),
      ).toMatchObject({
        refund: { method: 'manual', status: 'succeeded', amount: 70_000 },
        invoice: { status: 'refunded', refundedAmount: 100_000 },
      });
      expect((await t.hr().payments.refunds({ id })).data.map((row) => row.status)).toEqual([
        'succeeded',
        'failed',
        'succeeded',
      ]);

      // The plugin heard about its own invoice: paid, then two refunds (not the failed one).
      await settle();
      expect(api.rejected).toEqual([]);

      // Deliveries aren't ordered (one slow event never holds up the rest): payloads carry totals.
      const ours = api.received.filter((event) => event.payload.invoiceId === id);

      expect(ours.map((event) => event.type).toSorted((a, b) => a.localeCompare(b))).toEqual([
        'core.payment.paid',
        'core.payment.refunded',
        'core.payment.refunded',
      ]);
      expect(ours.find((event) => event.type === 'core.payment.paid')?.payload).toMatchObject({
        metadata,
        paidAmount: 100_000,
        source: 'hr',
      });

      // The audit log has each refund, with the invoice's currency to read its amount in.
      const refunds = (await t.owner().audit.list({ action: 'payment.refunded' })).data;

      expect(refunds).toHaveLength(2);
      expect(refunds.map((entry) => entry.metadata?.currency)).toEqual(['USD', 'USD']);
    } finally {
      await api.close();
    }
  });

  it('expires a pending invoice once its time is up, and announces it once', async () => {
    const invoice = await t.hr().payments.createInvoice(order('late'));

    expect((await t.hr().payments.getInvoice({ id: invoice.id })).status).toBe('pending');

    await adminDb()
      .update(paymentInvoices)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(paymentInvoices.id, invoice.id));

    expect((await t.hr().payments.getInvoice({ id: invoice.id })).status).toBe('expired');
    expect((await t.hr().payments.getInvoice({ id: invoice.id })).status).toBe('expired');

    const expired = (await t.owner().events.list({ type: 'core.payment.expired' })).data;

    expect(expired.map(({ entityType, entityId }) => [entityType, entityId])).toEqual([
      ['payment_invoice', invoice.id],
    ]);
  });

  it('refuses tampered or misdirected event deliveries', async () => {
    const createdAt = new Date().toISOString();
    const coreUrl = t.url('');

    const body = JSON.stringify({
      id: 'e1',
      type: 'core.payment.paid',
      organizationId: t.ids.org,
      createdAt,
      data: {
        id: 'e1',
        source: 'core',
        type: 'core.payment.paid',
        version: 1,
        subjectType: null,
        subjectId: null,
        entityType: 'payment_invoice',
        entityId: 'i1',
        actorType: 'system',
        actorId: null,
        payload: { amount: 150_000 },
        summary: null,
        link: null,
        occurredAt: createdAt,
        createdAt,
      },
    });

    const bearer = async (audience: string) =>
      `Bearer ${await signJwt(
        { org: t.ids.org, event: 'e1', sha: sha256(body, 'base64url') },
        { typ: CORE_EVENT_TYP, audience, subject: 'event:e1', expiresInSeconds: 60 },
      )}`;

    const asHr = { coreUrl, plugin: 'hr' };

    expect((await verifyCoreEvent(await bearer('hr'), body, asHr)).id).toBe('e1');
    await expect(
      verifyCoreEvent(await bearer('hr'), body.replace('e1', 'e2'), asHr),
    ).rejects.toThrow('the body does not match the token');
    await expect(verifyCoreEvent(await bearer('ecom'), body, asHr)).rejects.toThrow(/"aud"/);
    await expect(verifyCoreEvent(undefined, body, asHr)).rejects.toThrow('no core token');
  });
});
