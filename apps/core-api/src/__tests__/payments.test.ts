import { paymentInvoices } from '@erxes/core-db';
import { verifyCoreEvent } from '@erxes/plugin-sdk';
import { eq } from 'drizzle-orm';
import { expect, it } from 'vite-plus/test';
import { signJwt } from '~/lib/signing';
import { bodyDigest, CORE_EVENT_TYP } from '~/modules/plugins/pluginEvents';
import { adminDb, describeWithDb, useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** An invoice for an order. */
const order = (id: string, amount = 1000) => ({
  amount,
  description: `Order #${id}`,
  reference: { type: 'order', id },
});

describeWithDb('payments', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('lets a plugin bill for its record, confirms payment with the gateway, and announces it', async () => {
    await expect(t.hr().payments.createInvoice(order('o1'))).rejects.toMatchObject({
      code: 'NO_GATEWAY',
    });

    const gateway = await t.owner().payments.addGateway({ name: 'Test', config: { kind: 'test' } });
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
    expect((await fetch(t.url(`/core/v1/payments/callback/${id}?sig=forged`))).status).toBe(403);
    expect(await t.owner().payments.payTestInvoice({ id })).toMatchObject({ status: 'paid' });
    expect((await t.hr().payments.getInvoice({ id })).status).toBe('paid');

    const events = await t.owner().events.list({ type: 'core.payment.paid' });

    expect(events.data).toHaveLength(1);
    expect(events.data[0]?.payload).toMatchObject({
      invoiceId: id,
      source: 'hr',
      reference: { type: 'order', id: 'o1' },
      amount: 150_000,
    });

    // One with invoices can't be removed.
    await expect(t.owner().payments.removeGateway({ id: gateway.id })).rejects.toMatchObject({
      code: 'GATEWAY_IN_USE',
    });

    // Cancelling a pending one.
    const second = await t.hr().payments.createInvoice(order('o2'));

    expect((await t.hr().payments.cancelInvoice({ id: second.id })).status).toBe('cancelled');
    await expect(t.hr().payments.cancelInvoice({ id: second.id })).rejects.toMatchObject({
      code: 'NOT_PENDING',
    });
  });

  it('routes plugins to the gateways the owner chose, refunds safely, and delivers payment events to the plugin', async () => {
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
        .payments.addGateway({ name: 'Test B', config: { kind: 'test' } });

      const third = await t
        .owner()
        .payments.addGateway({ name: 'Test C', config: { kind: 'test' } });

      // Owner settings: hr may use B and C, B by default.
      expect((await t.owner().payments.pluginSettings({})).data).toEqual([
        expect.objectContaining({ plugin: 'hr', defaultGatewayId: null, allowedGatewayIds: [] }),
      ]);
      await expect(
        t.owner().payments.updatePluginSettings({
          plugin: 'hr',
          defaultGatewayId: third.id,
          allowedGatewayIds: [second.id],
        }),
      ).rejects.toMatchObject({ code: 'DEFAULT_NOT_ALLOWED' });
      await t.owner().payments.updatePluginSettings({
        plugin: 'hr',
        defaultGatewayId: second.id,
        allowedGatewayIds: [second.id, third.id],
      });

      // The audit log shows the change as [before, after].
      const changed = await t.owner().audit.list({ action: 'payment.plugin_settings_updated' });

      expect(changed.data[0]?.changes).toEqual({
        defaultGatewayId: [null, second.id],
        allowedGatewayIds: [[], [second.id, third.id]],
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

      // Not one it's allowed: refused. The first gateway (not allowed) can't be named.
      const first = (await t.owner().payments.gateways({})).data.find((row) => row.name === 'Test');

      await expect(
        t.hr().payments.createInvoice({ ...order('x', 1), gatewayId: first?.id }),
      ).rejects.toMatchObject({ code: 'GATEWAY_NOT_ALLOWED' });

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

      // The audit log has each refund.
      expect((await t.owner().audit.list({ action: 'payment.refunded' })).data).toHaveLength(2);
    } finally {
      await api.close();
    }
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
        subject: null,
        entity: { type: 'payment_invoice', id: 'i1' },
        actor: { type: 'system', id: null },
        payload: { amount: 150_000 },
        summary: null,
        link: null,
        occurredAt: createdAt,
        createdAt,
      },
    });

    const bearer = async (audience: string) =>
      `Bearer ${await signJwt(
        { org: t.ids.org, event: 'e1', sha: bodyDigest(body) },
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
