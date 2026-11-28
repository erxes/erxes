import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { hmacSha256 } from '~/lib/crypto';
import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal, tugrugInvoice } from './fakeGateway';

const SOCIALPAY = 'https://instore.golomtbank.com/pos/invoice';
const hmac = (text: string) => hmacSha256('k', text, 'hex');
const Probe = z.object({ amount: z.string(), invoice: z.string() });

const ok = (response: Record<string, unknown>) => ({ header: { code: 200 }, body: { response } });

const connect = (routes: [string, unknown, number?][]) => {
  const gateway = fakeGateway(routes);

  const { payments, client } = openGateway(
    'socialpay',
    { terminal: 'T1', terminalKey: 'k' },
    { fetch: gateway.fetch },
  );

  const invoice = { gatewayInvoiceId: 'inv1', amount: 150_000, state: {} };

  return { gateway, payments, client, invoice };
};

describe('SocialPay driver', () => {
  it('sends the invoice to the payer’s phone, signed with it, and shows nothing to scan', async () => {
    const { gateway, payments, client } = connect([['/phone', ok({ status: 'SUCCESS' })]]);

    expect(
      await payments.createInvoice(client, { ...tugrugInvoice, payerPhone: '9911-2233' }),
    ).toEqual({
      gatewayInvoiceId: 'inv1',
      payment: { qrText: null, qrImage: null, shortUrl: null, links: [] },
    });
    expect(gateway.calls[0]).toMatchObject({ method: 'POST', url: `${SOCIALPAY}/phone` });
    expect(gateway.sent('/phone')).toEqual({
      amount: '1500',
      invoice: 'inv1',
      terminal: 'T1',
      phone: '99112233',
      checksum: hmac('T1inv1150099112233'),
    });

    const refused = connect([['/phone', ok({ status: 'FAILED', desc: 'Unknown phone' })]]);

    await expect(
      refused.payments.createInvoice(refused.client, { ...tugrugInvoice, payerPhone: '99112233' }),
    ).rejects.toMatchObject({ name: 'GatewayError' });
  });

  it('makes a deeplink QR at its address, and refuses one SocialPay did not make', async () => {
    const { gateway, payments, client } = connect([
      ['/qr/deeplink', ok({ status: 'SUCCESS', desc: 'socialpay://pay/1' })],
    ]);

    await payments.createInvoice(client, tugrugInvoice);
    expect(gateway.calls[0]).toMatchObject({ method: 'POST', url: `${SOCIALPAY}/qr/deeplink` });

    for (const answer of [
      ok({ status: 'FAILED', desc: 'socialpay://pay/1' }),
      ok({ status: 'SUCCESS' }),
      { header: { code: 500 }, body: { response: { status: 'SUCCESS', desc: 'x' } } },
    ]) {
      const refused = connect([['/qr/deeplink', answer]]);

      await expect(
        refused.payments.createInvoice(refused.client, tugrugInvoice),
      ).rejects.toMatchObject({
        name: 'GatewayError',
      });
    }
  });

  it('says why SocialPay refused, and fails an unreadable answer', async () => {
    for (const [answer, message] of [
      [{ header: { code: 401 }, body: { error: { errorDesc: 'Bad terminal' } } }, 'Bad terminal'],
      [{ header: { code: 401 } }, '401'],
      [{ header: 'none' }, 'SocialPay gave an unreadable answer'],
    ] as const) {
      const { payments, client, invoice } = connect([['/check', answer]]);

      expect((await refusal(payments.check(client, invoice))).message).toContain(message);
    }

    const { payments, client, invoice } = connect([['/check', { error: 'down' }, 503]]);
    const { status, message } = await refusal(payments.check(client, invoice));

    expect(status).toBe(503);
    expect(message).toMatch(/^SocialPay \/check answered 503/);
  });

  it('pays only a 00 check of the whole amount, the invoice amount when it names none', async () => {
    const { payments, client } = connect([['/check', ok({ resp_code: '00' })]]);

    const check = (answer: unknown) => {
      const opened = connect([['/check', answer]]);

      return opened.payments.check(opened.client, opened.invoice);
    };

    expect(
      await payments.check(client, { gatewayInvoiceId: 'inv1', amount: 150_000, state: {} }),
    ).toEqual({ paid: true, paidAmount: 150_000, paymentId: 'inv1' });
    expect(await check(ok({ resp_code: '00', amount: '1000' }))).toEqual({
      paid: false,
      paidAmount: 100_000,
      paymentId: 'inv1',
    });

    const unpaid = { paid: false, paidAmount: 0, paymentId: null };

    expect(await check(ok({ resp_code: '05', amount: '1500' }))).toEqual(unpaid);
    expect(await check({ header: { code: 200 } })).toEqual(unpaid);
  });

  it('cancels an invoice, fails one SocialPay keeps, and makes no refunds', async () => {
    const done = connect([['/cancel', ok({ resp_code: '00' })]]);

    await done.payments.cancel(done.client, done.invoice);
    expect(done.gateway.sent('/cancel')).toEqual({
      amount: '1500',
      invoice: 'inv1',
      terminal: 'T1',
      checksum: hmac('T1inv11500'),
    });

    const kept = connect([['/cancel', ok({ resp_code: '51', resp_desc: 'Already paid' })]]);

    expect((await refusal(kept.payments.cancel(kept.client, kept.invoice))).message).toContain(
      'Already paid',
    );
    await expect(
      done.payments.refund(done.client, { paymentId: 'inv1', amount: 1, note: '', state: {} }),
    ).rejects.toMatchObject({ name: 'GatewayError', message: 'SocialPay makes no refunds' });
  });

  it('verifies with a ₮1 invoice it then cancels, even when the cancel fails', async () => {
    const { gateway, client } = connect([
      ['/qr/deeplink', ok({ status: 'SUCCESS', desc: 'socialpay://pay/probe' })],
      ['/cancel', { error: 'down' }, 503],
    ]);

    await gatewayOf('socialpay').verify(client);

    const [created, cancelled] = gateway.calls;
    const probe = Probe.parse(gateway.sent('/qr/deeplink'));

    expect(probe.amount).toBe('1');
    expect(probe.invoice).toMatch(/^probe/);
    expect(created?.url).toBe(`${SOCIALPAY}/qr/deeplink`);
    expect(cancelled?.url).toBe(`${SOCIALPAY}/cancel`);
    expect(gateway.sent('/cancel')).toEqual(gateway.sent('/qr/deeplink'));
  });
});
