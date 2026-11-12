import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { createApp } from '~/app';
import { createGateway } from '@erxes/payment-gateways';
import { verifyCoreEvent } from '@erxes/plugin-sdk';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { currentToken, describeWithDb, useTestDatabase } from './db';
import { pluginToken } from './plugin';

describe('QPay driver', () => {
  it('gets a token, makes an invoice in tögrög with QR and bank links, and checks payment by invoice', async () => {
    const calls: { url: string; body: unknown; auth: string | null }[] = [];

    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      const headers = new Headers(init.headers);

      calls.push({
        url,
        body: init.body ? JSON.parse(String(init.body)) : null,
        auth: headers.get('authorization'),
      });

      const reply = url.endsWith('/auth/token')
        ? { access_token: 'tok', expires_in: Math.floor(Date.now() / 1000) + 3600 }
        : url.endsWith('/invoice')
          ? {
              invoice_id: 'q-1',
              qr_text: 'QRTEXT',
              qr_image: 'iVBOR',
              qPay_shortUrl: 'https://s.qpay.mn/x',
              urls: [{ name: 'Khan', logo: 'l', link: 'khanbank://q' }],
            }
          : url.includes('/payment/refund/')
            ? {}
            : {
                count: 1,
                paid_amount: 1500,
                rows: [{ payment_id: 'p-9', payment_status: 'PAID', payment_amount: '1500.00' }],
              };

      return new Response(JSON.stringify(reply), { status: 200 });
    });

    vi.stubGlobal('fetch', fetchMock);

    try {
      const driver = createGateway(
        {
          kind: 'qpay',
          clientId: 'id',
          clientSecret: 'secret',
          invoiceCode: 'CODE',
          sandbox: true,
        },
        { cacheKey: 'g-1' },
      );

      const created = await driver.createInvoice({
        invoiceId: 'inv-1',
        amount: 150_000,
        description: 'Order #1',
        callbackUrl: 'https://x/cb',
      });

      expect(calls[0]).toMatchObject({
        url: 'https://merchant-sandbox.qpay.mn/v2/auth/token',
        auth: `Basic ${Buffer.from('id:secret').toString('base64')}`,
      });
      expect(calls[1]).toMatchObject({
        url: 'https://merchant-sandbox.qpay.mn/v2/invoice',
        auth: 'Bearer tok',
        body: {
          invoice_code: 'CODE',
          sender_invoice_no: 'inv-1',
          amount: 1500,
          callback_url: 'https://x/cb',
        },
      });
      expect(created).toMatchObject({
        gatewayInvoiceId: 'q-1',
        payment: {
          qrText: 'QRTEXT',
          qrImage: 'data:image/png;base64,iVBOR',
          links: [{ name: 'Khan', link: 'khanbank://q' }],
        },
      });
      expect(await driver.check('q-1', 150_000, {})).toMatchObject({
        paid: true,
        paidAmount: 150_000,
        paymentId: 'p-9',
      });
      expect((await driver.check('q-1', 150_100, {})).paid).toBe(false);

      await driver.refund({ paymentId: 'p-9', amount: 150_000, note: 'Out of stock' }, {});
      expect(calls.at(-1)).toMatchObject({
        url: 'https://merchant-sandbox.qpay.mn/v2/payment/refund/p-9',
        body: { note: 'Out of stock' },
      });
      expect(driver.refunds).toBe('full');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describeWithDb('payments', { timeout: 240_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let owner = '';

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    orgId = acme.organization.id;
    owner = await currentToken(acme.owner.id, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('lets a plugin bill for its record, confirms payment with the gateway, and announces it', async () => {
    const hr = await pluginToken(base, orgId);

    expect(
      (
        await call(hr, 'POST', '/payments/invoices', {
          amount: 150_000,
          description: 'x',
          reference: { type: 'order', id: 'o1' },
        })
      ).body.code,
    ).toBe('NO_GATEWAY');

    const gateway = await call(owner, 'POST', '/payments/gateways', {
      name: 'Test',
      config: { kind: 'test' },
    });

    expect(gateway.status).toBe(201);

    const input = {
      amount: 150_000,
      description: 'Order #1',
      reference: { type: 'order', id: 'o1' },
      dedupeKey: 'order-o1',
    };

    const invoice = await call(hr, 'POST', '/payments/invoices', input);

    expect(invoice.status).toBe(201);
    expect(invoice.body).toMatchObject({
      status: 'pending',
      source: 'hr',
      amount: 150_000,
      payment: { qrText: `TEST:${invoice.body.id}` },
    });
    // Retry-safe.
    expect((await call(hr, 'POST', '/payments/invoices', input)).body.id).toBe(invoice.body.id);

    // A callback that isn't ours is refused; ours only makes core ask the gateway.
    expect(
      (await fetch(`${base}/core/v1/payments/callback/${invoice.body.id}?sig=forged`)).status,
    ).toBe(403);

    expect(
      (await call(owner, 'POST', `/payments/invoices/${invoice.body.id}/test-pay`)).body,
    ).toMatchObject({ status: 'paid' });
    expect((await call(hr, 'GET', `/payments/invoices/${invoice.body.id}`)).body.status).toBe(
      'paid',
    );

    const events = await call(owner, 'GET', '/events?type=core.payment.paid');

    expect(events.body.data).toHaveLength(1);
    expect(events.body.data[0].payload).toMatchObject({
      invoiceId: invoice.body.id,
      source: 'hr',
      reference: { type: 'order', id: 'o1' },
      amount: 150_000,
    });

    // Gateways never show their secrets; one with invoices can't be removed.
    expect((await call(owner, 'DELETE', `/payments/gateways/${gateway.body.id}`)).body.code).toBe(
      'GATEWAY_IN_USE',
    );

    // Cancelling a pending one.
    const second = await call(hr, 'POST', '/payments/invoices', {
      amount: 1000,
      description: 'Order #2',
      reference: { type: 'order', id: 'o2' },
    });

    expect(
      (await call(hr, 'POST', `/payments/invoices/${second.body.id}/cancel`)).body.status,
    ).toBe('cancelled');
    expect((await call(hr, 'POST', `/payments/invoices/${second.body.id}/cancel`)).body.code).toBe(
      'NOT_PENDING',
    );
  });

  it('routes plugins to the gateways the owner chose, refunds safely, and delivers payment events to the plugin', async () => {
    const { adminDb } = await import('./db');
    const { paymentInvoices } = await import('@erxes/core-db');
    const { eq } = await import('drizzle-orm');
    const { processEvents } = await import('~/modules/events/processor');
    const { processJobs } = await import('~/modules/jobs/jobs');
    const { JOBS } = await import('~/modules/jobs/registry');

    const flush = async () => {
      let idle = 0;

      for (let round = 0; round < 15 && idle < 2; round += 1) {
        idle = (await processEvents()) + (await processJobs(JOBS)) ? 0 : idle + 1;
      }
    };

    // The plugin's API: records what core delivers, after verifying it like a plugin would.
    const received: { type: string; payload: Record<string, unknown> }[] = [];
    const rejected: string[] = [];

    const pluginApi = createServer((req, res) => {
      let raw = '';

      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => {
        verifyCoreEvent(req.headers.authorization, raw, { coreUrl: base, plugin: 'hr' })
          .then((event) => {
            received.push({
              type: event.type,
              payload: event.data.payload,
            });
            res.writeHead(204).end();
          })
          .catch((error: Error) => {
            rejected.push(error.message);
            res.writeHead(401).end();
          });
      });
    }).listen(0);

    const apiUrl = `http://127.0.0.1:${(pluginApi.address() as AddressInfo).port}`;

    try {
      expect(
        (
          await call(await pluginToken(base), 'PUT', '/plugins/manifest', {
            title: 'HR',
            version: '2',
            api: { url: apiUrl },
            scopes: ['payments:read', 'payments:write'],
            subscriptions: ['core.payment.*'],
          })
        ).status,
      ).toBe(200);

      const hr = await pluginToken(base, orgId);

      const second = await call(owner, 'POST', '/payments/gateways', {
        name: 'Test B',
        config: { kind: 'test' },
      });

      const third = await call(owner, 'POST', '/payments/gateways', {
        name: 'Test C',
        config: { kind: 'test' },
      });

      // Owner settings: hr may use B and C, B by default.
      const listed = await call(owner, 'GET', '/payments/plugins');

      expect(listed.body.data).toEqual([
        expect.objectContaining({ plugin: 'hr', defaultGatewayId: null, allowedGatewayIds: [] }),
      ]);
      expect(
        (
          await call(owner, 'PUT', '/payments/plugins/hr', {
            defaultGatewayId: third.body.id,
            allowedGatewayIds: [second.body.id],
          })
        ).body.code,
      ).toBe('DEFAULT_NOT_ALLOWED');
      expect(
        (
          await call(owner, 'PUT', '/payments/plugins/hr', {
            defaultGatewayId: second.body.id,
            allowedGatewayIds: [second.body.id, third.body.id],
          })
        ).status,
      ).toBe(200);

      const metadata = { orderId: 'o9', lines: [{ sku: 'A', qty: 2 }] };

      const invoice = await call(hr, 'POST', '/payments/invoices', {
        amount: 100_000,
        description: 'Order #9',
        reference: { type: 'order', id: 'o9' },
        metadata,
      });

      expect(invoice.body).toMatchObject({
        gatewayId: second.body.id,
        metadata,
        refundedAmount: 0,
        refundable: { amount: 0, gateway: 'partial' },
      });

      // Not one it's allowed: refused. The first gateway (not allowed) can't be named.
      const first = (await call(owner, 'GET', '/payments/gateways')).body.data.find(
        (row: { name: string }) => row.name === 'Test',
      );

      expect(
        (
          await call(hr, 'POST', '/payments/invoices', {
            gatewayId: first.id,
            amount: 1,
            description: 'x',
            reference: { type: 'order', id: 'x' },
          })
        ).body.code,
      ).toBe('GATEWAY_NOT_ALLOWED');

      // Nothing to refund before it's paid.
      expect(
        (await call(hr, 'POST', `/payments/invoices/${invoice.body.id}/refunds`, { reason: 'x' }))
          .body.code,
      ).toBe('NOT_REFUNDABLE');

      expect(
        (await call(owner, 'POST', `/payments/invoices/${invoice.body.id}/test-pay`)).body,
      ).toMatchObject({
        status: 'paid',
        paidAmount: 100_000,
        refundable: { amount: 100_000 },
      });

      // Part, retry-safe; more than is left is refused.
      const part = await call(hr, 'POST', `/payments/invoices/${invoice.body.id}/refunds`, {
        amount: 30_000,
        reason: 'One item missing',
        dedupeKey: 'r1',
      });

      expect(part.status).toBe(201);
      expect(part.body).toMatchObject({
        refund: { amount: 30_000, method: 'gateway', status: 'succeeded' },
        invoice: { status: 'paid', refundedAmount: 30_000 },
      });
      expect(
        (
          await call(hr, 'POST', `/payments/invoices/${invoice.body.id}/refunds`, {
            amount: 30_000,
            reason: 'again',
            dedupeKey: 'r1',
          })
        ).body.refund.id,
      ).toBe(part.body.refund.id);
      expect(
        (
          await call(hr, 'POST', `/payments/invoices/${invoice.body.id}/refunds`, {
            amount: 80_000,
            reason: 'too much',
          })
        ).body.code,
      ).toBe('NOT_REFUNDABLE');

      // A refusal by the gateway is kept and changes nothing.
      await adminDb()
        .update(paymentInvoices)
        .set({ payment: { testPaid: true, testRefundFails: true } })
        .where(eq(paymentInvoices.id, invoice.body.id));

      const refused = await call(owner, 'POST', `/payments/invoices/${invoice.body.id}/refunds`, {
        reason: 'Customer asked',
      });

      expect(refused.body).toMatchObject({
        refund: { status: 'failed', amount: 70_000 },
        invoice: { refundedAmount: 30_000 },
      });

      // Paid back by hand: recorded, and the rest is refunded.
      const manual = await call(owner, 'POST', `/payments/invoices/${invoice.body.id}/refunds`, {
        reason: 'Cash back',
        manual: true,
      });

      expect(manual.body).toMatchObject({
        refund: { method: 'manual', status: 'succeeded', amount: 70_000 },
        invoice: { status: 'refunded', refundedAmount: 100_000 },
      });
      expect(
        (await call(hr, 'GET', `/payments/invoices/${invoice.body.id}/refunds`)).body.data.map(
          (row: { status: string }) => row.status,
        ),
      ).toEqual(['succeeded', 'failed', 'succeeded']);

      // The plugin heard about its own invoice: paid, then two refunds (not the failed one).
      await flush();

      expect(rejected).toEqual([]);
      // Deliveries aren't ordered (one slow event never holds up the rest): payloads carry totals.
      expect(
        received
          .filter((event) => event.payload.invoiceId === invoice.body.id)
          .map((event) => event.type)
          .sort(),
      ).toEqual(['core.payment.paid', 'core.payment.refunded', 'core.payment.refunded']);
      expect(
        received.find(
          (event) =>
            event.type === 'core.payment.paid' && event.payload.invoiceId === invoice.body.id,
        )?.payload,
      ).toMatchObject({ metadata, paidAmount: 100_000, source: 'hr' });

      // Members need the refund permission; the audit log has each refund.
      const audit = await call(owner, 'GET', '/audit?action=payment.refunded');

      expect(audit.body.data).toHaveLength(2);
    } finally {
      pluginApi.closeAllConnections();
      await new Promise<void>((resolve) => pluginApi.close(() => resolve()));
    }
  });

  it('refuses tampered or misdirected event deliveries', async () => {
    const { signJwt } = await import('~/lib/signing');
    const { bodyDigest, CORE_EVENT_TYP } = await import('~/modules/plugins/pluginEvents');

    const createdAt = new Date().toISOString();

    const body = JSON.stringify({
      id: 'e1',
      type: 'core.payment.paid',
      organizationId: orgId,
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

    const token = (aud: string, sha = bodyDigest(body)) =>
      signJwt(
        { org: orgId, event: 'e1', sha },
        { typ: CORE_EVENT_TYP, audience: aud, subject: 'event:e1', expiresInSeconds: 60 },
      );

    expect(
      (await verifyCoreEvent(`Bearer ${await token('hr')}`, body, { coreUrl: base, plugin: 'hr' }))
        .id,
    ).toBe('e1');
    await expect(
      verifyCoreEvent(`Bearer ${await token('hr')}`, body.replace('e1', 'e2'), {
        coreUrl: base,
        plugin: 'hr',
      }),
    ).rejects.toThrow();
    await expect(
      verifyCoreEvent(`Bearer ${await token('ecom')}`, body, { coreUrl: base, plugin: 'hr' }),
    ).rejects.toThrow();
    await expect(verifyCoreEvent(undefined, body, { coreUrl: base, plugin: 'hr' })).rejects.toThrow(
      'no core token',
    );
  });

  it('refuses QPay credentials the gateway rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"error":"NO_CREDENDIALS"}', { status: 401 })),
    );

    try {
      const { addGateway } = await import('~/modules/payments/payments.service');
      const { withOrg } = await import('@erxes/core-db');

      await expect(
        withOrg(orgId, (tx) =>
          addGateway(
            tx,
            { userId: 'x', orgId, role: 'owner', permissions: ['*'] },
            {
              name: 'QPay',
              config: {
                kind: 'qpay',
                clientId: 'bad',
                clientSecret: 'bad',
                invoiceCode: 'X',
                sandbox: true,
              },
            },
          ),
        ),
      ).rejects.toMatchObject({ code: 'GATEWAY_REFUSED' });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
