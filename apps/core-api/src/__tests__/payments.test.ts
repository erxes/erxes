import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '~/app';
import { driverOf } from '~/modules/payments/gateways';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { currentToken, describeWithDb, useTestDatabase } from './db';
import { pluginToken } from './plugin';

describe('QPay driver', () => {
  it('gets a token, makes an invoice in tögrög with QR and bank links, and checks payment by invoice', async () => {
    const calls: { url: string; body: unknown; auth: string | null }[] = [];
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      const headers = new Headers(init.headers);

      calls.push({ url, body: init.body ? JSON.parse(String(init.body)) : null, auth: headers.get('authorization') });

      const reply = url.endsWith('/auth/token')
        ? { access_token: 'tok', expires_in: Math.floor(Date.now() / 1000) + 3600 }
        : url.endsWith('/invoice')
          ? { invoice_id: 'q-1', qr_text: 'QRTEXT', qr_image: 'iVBOR', qPay_shortUrl: 'https://s.qpay.mn/x', urls: [{ name: 'Khan', logo: 'l', link: 'khanbank://q' }] }
          : { count: 1, paid_amount: 1500 };

      return new Response(JSON.stringify(reply), { status: 200 });
    });

    vi.stubGlobal('fetch', fetchMock);

    try {
      const driver = driverOf('g-1', { kind: 'qpay', clientId: 'id', clientSecret: 'secret', invoiceCode: 'CODE', sandbox: true });
      const created = await driver.createInvoice({ invoiceId: 'inv-1', amount: 150_000, description: 'Order #1', callbackUrl: 'https://x/cb' });

      expect(calls[0]).toMatchObject({ url: 'https://merchant-sandbox.qpay.mn/v2/auth/token', auth: `Basic ${Buffer.from('id:secret').toString('base64')}` });
      expect(calls[1]).toMatchObject({
        url: 'https://merchant-sandbox.qpay.mn/v2/invoice',
        auth: 'Bearer tok',
        body: { invoice_code: 'CODE', sender_invoice_no: 'inv-1', amount: 1500, callback_url: 'https://x/cb' },
      });
      expect(created).toMatchObject({
        gatewayInvoiceId: 'q-1',
        payment: { qrText: 'QRTEXT', qrImage: 'data:image/png;base64,iVBOR', links: [{ name: 'Khan', link: 'khanbank://q' }] },
      });
      expect(await driver.isPaid('q-1', 150_000, {})).toBe(true);
      expect(await driver.isPaid('q-1', 150_100, {})).toBe(false);
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
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'o@acme.mn' } });

    orgId = acme.organization.id;
    owner = await currentToken(acme.owner.id, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("lets a plugin bill for its record, confirms payment with the gateway, and announces it", async () => {
    const hr = await pluginToken(base, orgId);

    expect((await call(hr, 'POST', '/payments/invoices', { amount: 150_000, description: 'x', reference: { type: 'order', id: 'o1' } })).body.code).toBe(
      'NO_GATEWAY',
    );

    const gateway = await call(owner, 'POST', '/payments/gateways', { name: 'Test', config: { kind: 'test' } });

    expect(gateway.status).toBe(201);

    const input = { amount: 150_000, description: 'Order #1', reference: { type: 'order', id: 'o1' }, dedupeKey: 'order-o1' };
    const invoice = await call(hr, 'POST', '/payments/invoices', input);

    expect(invoice.status).toBe(201);
    expect(invoice.body).toMatchObject({ status: 'pending', source: 'hr', amount: 150_000, payment: { qrText: `TEST:${invoice.body.id}` } });
    // Retry-safe.
    expect((await call(hr, 'POST', '/payments/invoices', input)).body.id).toBe(invoice.body.id);

    // A callback that isn't ours is refused; ours only makes core ask the gateway.
    expect((await fetch(`${base}/core/v1/payments/callback/${invoice.body.id}?sig=forged`)).status).toBe(403);

    expect((await call(owner, 'POST', `/payments/invoices/${invoice.body.id}/test-pay`)).body).toMatchObject({ status: 'paid' });
    expect((await call(hr, 'GET', `/payments/invoices/${invoice.body.id}`)).body.status).toBe('paid');

    const events = await call(owner, 'GET', '/events?type=core.payment.paid');

    expect(events.body.data).toHaveLength(1);
    expect(events.body.data[0].payload).toMatchObject({ invoiceId: invoice.body.id, source: 'hr', reference: { type: 'order', id: 'o1' }, amount: 150_000 });

    // Gateways never show their secrets; one with invoices can't be removed.
    expect((await call(owner, 'DELETE', `/payments/gateways/${gateway.body.id}`)).body.code).toBe('GATEWAY_IN_USE');

    // Cancelling a pending one.
    const second = await call(hr, 'POST', '/payments/invoices', { amount: 1000, description: 'Order #2', reference: { type: 'order', id: 'o2' } });

    expect((await call(hr, 'POST', `/payments/invoices/${second.body.id}/cancel`)).body.status).toBe('cancelled');
    expect((await call(hr, 'POST', `/payments/invoices/${second.body.id}/cancel`)).body.code).toBe('NOT_PENDING');
  });

  it('refuses QPay credentials the gateway rejects', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":"NO_CREDENDIALS"}', { status: 401 })));

    try {
      const { addGateway } = await import('~/modules/payments/payments.service');
      const { withOrg } = await import('@erxes/core-db');

      await expect(
        withOrg(orgId, (tx) =>
          addGateway(tx, { userId: 'x', orgId, role: 'owner', permissions: ['*'] }, {
            name: 'QPay',
            config: { kind: 'qpay', clientId: 'bad', clientSecret: 'bad', invoiceCode: 'X', sandbox: true },
          }),
        ),
      ).rejects.toMatchObject({ code: 'GATEWAY_REFUSED' });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
