import { z } from 'zod';
import { gatewayHttp, json, parse, qrInstructions, Text, tokenCache, toTugrug } from './http';
import { type DriverOptions, type GatewayDriver, GatewayError, type PocketConfig } from './types';

const TokenAnswer = z.object({
  access_token: z.string().min(1),
  expires_in: z.coerce.number().optional(),
});

const InvoiceAnswer = z.object({
  id: Text.pipe(z.string().min(1)),
  qr: z.string().min(1),
  deeplink: z.string().nullish(),
});

const CheckAnswer = z.object({ state: z.string() });

/**
 * Pocket (InvesCore) invoices: a QR and app deeplink for the terminal, checked
 * by invoice id. Token by client credentials from InvesCore's sign-in.
 */
export const pocketDriver = (config: PocketConfig, options: DriverOptions = {}): GatewayDriver => {
  const send = gatewayHttp('Pocket', 'https://service.invescore.mn/merchant/v2/invoicing', options);
  const signIn = gatewayHttp('Pocket', 'https://sso.invescore.mn/auth/realms/invescore', options);
  const terminalId = Number(config.terminalId);

  const cache = tokenCache(`pocket:${options.cacheKey ?? config.clientId}`, async () => {
    const answer = parse(
      'Pocket',
      TokenAnswer,
      await signIn('/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          grant_type: 'client_credentials',
        }).toString(),
      }),
      'no access token',
    );

    return { token: answer.access_token, expiresIn: answer.expires_in };
  });

  const post = async (path: string, body: Record<string, unknown>) =>
    send(path, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await cache.token()}` },
      body: json(body),
    });

  return {
    kind: 'pocket',
    async verify() {
      if (!Number.isInteger(terminalId) || terminalId <= 0)
        throw new GatewayError('The Pocket terminal id is a positive number', 400);
      cache.forget();
      await cache.token();
    },
    async createInvoice(input) {
      const answer = parse(
        'Pocket',
        InvoiceAnswer,
        await post('/generate-invoice', {
          terminalId,
          amount: toTugrug(input.amount),
          info: input.description,
          orderNumber: input.invoiceId,
          invoiceType: 'ZERO',
          channel: 'ecommerce',
        }),
        'no invoice',
      );

      return {
        gatewayInvoiceId: answer.id,
        payment: await qrInstructions(
          answer.qr,
          answer.deeplink ? [{ name: 'Pocket', link: answer.deeplink }] : [],
        ),
      };
    },
    async check(gatewayInvoiceId, amount) {
      const answer = parse(
        'Pocket',
        CheckAnswer,
        await post('/invoices/invoice-id', { terminalId, invoiceId: Number(gatewayInvoiceId) }),
        'an unreadable check',
      );

      const paid = answer.state === 'paid';

      return { paid, paidAmount: paid ? amount : 0, paymentId: paid ? gatewayInvoiceId : null };
    },
    async cancel() {
      // Pocket has no invoice cancellation; an unpaid one lapses.
    },
    refund() {
      return Promise.reject(new GatewayError('Pocket makes no refunds'));
    },
  };
};
