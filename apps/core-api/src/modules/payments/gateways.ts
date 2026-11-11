import type { GatewayConfig } from '@erxes/core-contract';

/** What core needs from any payment gateway. */
export interface GatewayDriver {
  /** Checks the credentials (on connecting). */
  verify(): Promise<void>;
  createInvoice(input: { invoiceId: string; amount: number; description: string; callbackUrl: string }): Promise<{
    gatewayInvoiceId: string;
    payment: { qrText: string | null; qrImage: string | null; shortUrl: string | null; links: { name: string; logo: string | null; link: string }[] };
  }>;
  /** Paid in full? Asked of the gateway itself (callbacks are never trusted alone). */
  isPaid(gatewayInvoiceId: string, amount: number, state: Record<string, unknown>): Promise<boolean>;
  cancel(gatewayInvoiceId: string): Promise<void>;
}

const tokens = new Map<string, { token: string; expiresAt: number }>();

/**
 * QPay v2 (merchant.qpay.mn): token by client credentials, invoices with QR
 * and bank app links, payment check by invoice. Amounts go in tögrög.
 */
const qpay = (gatewayId: string, config: Extract<GatewayConfig, { kind: 'qpay' }>): GatewayDriver => {
  const base = config.sandbox ? 'https://merchant-sandbox.qpay.mn/v2' : 'https://merchant.qpay.mn/v2';

  const request = async (path: string, init: RequestInit & { auth?: 'basic' | 'bearer' } = {}) => {
    const headers = new Headers(init.headers);

    headers.set('Content-Type', 'application/json');
    headers.set(
      'Authorization',
      init.auth === 'basic'
        ? `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
        : `Bearer ${await token()}`,
    );

    const response = await fetch(`${base}${path}`, { ...init, headers, signal: AbortSignal.timeout(15_000) });
    const text = await response.text();

    if (!response.ok) throw new Error(`QPay ${path} answered ${response.status}: ${text.slice(0, 300)}`);

    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  };

  const token = async (): Promise<string> => {
    const cached = tokens.get(gatewayId);

    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.token;

    const body = await request('/auth/token', { method: 'POST', auth: 'basic' });
    const value = String(body.access_token ?? '');
    // QPay's `expires_in` is an absolute unix time.
    const expires = Number(body.expires_in ?? 0);

    tokens.set(gatewayId, { token: value, expiresAt: expires > 1e9 ? expires * 1000 : Date.now() + 3600_000 });

    return value;
  };

  return {
    async verify() {
      tokens.delete(gatewayId);
      await token();
    },
    async createInvoice(input) {
      const body = await request('/invoice', {
        method: 'POST',
        body: JSON.stringify({
          invoice_code: config.invoiceCode,
          sender_invoice_no: input.invoiceId,
          invoice_receiver_code: 'terminal',
          invoice_description: input.description,
          amount: input.amount / 100,
          callback_url: input.callbackUrl,
        }),
      });
      const urls = Array.isArray(body.urls) ? (body.urls as { name?: string; logo?: string; link?: string }[]) : [];

      return {
        gatewayInvoiceId: String(body.invoice_id),
        payment: {
          qrText: typeof body.qr_text === 'string' ? body.qr_text : null,
          qrImage: typeof body.qr_image === 'string' ? `data:image/png;base64,${body.qr_image}` : null,
          shortUrl: typeof body.qPay_shortUrl === 'string' ? body.qPay_shortUrl : null,
          links: urls.filter((url) => url.link).map((url) => ({ name: url.name ?? '', logo: url.logo ?? null, link: url.link! })),
        },
      };
    },
    async isPaid(gatewayInvoiceId, amount) {
      const body = await request('/payment/check', {
        method: 'POST',
        body: JSON.stringify({ object_type: 'INVOICE', object_id: gatewayInvoiceId, offset: { page_number: 1, page_limit: 100 } }),
      });

      return Number(body.paid_amount ?? 0) * 100 >= amount;
    },
    async cancel(gatewayInvoiceId) {
      await request(`/invoice/${encodeURIComponent(gatewayInvoiceId)}`, { method: 'DELETE' });
    },
  };
};

/** For development and tests: nothing leaves erxes; `test-pay` marks it paid. */
const testGateway: GatewayDriver = {
  async verify() {},
  async createInvoice(input) {
    return {
      gatewayInvoiceId: `test_${input.invoiceId}`,
      payment: { qrText: `TEST:${input.invoiceId}`, qrImage: null, shortUrl: null, links: [] },
    };
  },
  async isPaid(_id, _amount, state) {
    return state.testPaid === true;
  },
  async cancel() {},
};

export const driverOf = (gatewayId: string, config: GatewayConfig): GatewayDriver =>
  config.kind === 'qpay' ? qpay(gatewayId, config) : testGateway;
