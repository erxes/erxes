import { describe, expect, it } from 'vite-plus/test';
import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal } from './fakeGateway';

const connect = (routes: [string, unknown, number?][]) => {
  const gateway = fakeGateway(routes);

  return {
    gateway,
    ...openGateway('stripe', { secretKey: 'sk_test' }, { fetch: gateway.fetch }),
  };
};

const session = { gatewayInvoiceId: 'cs_1', amount: 1500, state: {} };

describe('Stripe driver', () => {
  it('verifies the secret key by reading the balance, which a wrong key refuses', async () => {
    const good = connect([['GET /v1/balance', { object: 'balance' }]]);

    await gatewayOf('stripe').verify(good.client);
    expect(good.gateway.calls).toMatchObject([
      { method: 'GET', url: 'https://api.stripe.com/v1/balance', auth: 'Bearer sk_test' },
    ]);

    const bad = connect([['/v1/balance', { error: { type: 'invalid_request_error' } }, 401]]);

    const { status, message } = await refusal(gatewayOf('stripe').verify(bad.client));

    expect(status).toBe(401);
    expect(message).toMatch(/^Stripe \/balance answered 401/);
  });

  it('expires a session to cancel it', async () => {
    const { gateway, payments, client } = connect([['POST /expire', { id: 'cs_1' }]]);

    await payments.cancel(client, session);
    expect(gateway.calls).toMatchObject([
      { method: 'POST', url: 'https://api.stripe.com/v1/checkout/sessions/cs_1/expire' },
    ]);
  });

  it('refunds with the note Stripe keeps, and fails a refund it gives no id for', async () => {
    const { gateway, payments, client } = connect([['POST /v1/refunds', { id: 're_1' }]]);

    await payments.refund(client, {
      paymentId: 'pi_1',
      amount: 500,
      note: 'n'.repeat(600),
      state: {},
    });
    expect(new URLSearchParams(gateway.calls[0]?.body).get('metadata[note]')).toBe('n'.repeat(500));

    const odd = connect([['POST /v1/refunds', { object: 'refund' }]]);

    await expect(
      odd.payments.refund(odd.client, { paymentId: 'pi_1', amount: 500, note: '', state: {} }),
    ).rejects.toMatchObject({ name: 'GatewayError', message: 'Stripe gave no refund' });
  });
});
