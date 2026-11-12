import { type DriverOptions, type GatewayDriver, GatewayError, type QPayConfig } from './types';

const tokens = new Map<string, { token: string; expiresAt: number }>();

interface QPayPaymentRow {
  payment_id?: string | number;
  payment_status?: string;
  payment_amount?: string | number;
}

/**
 * QPay v2: token by client credentials; invoices with QR and bank app links;
 * payment check by invoice; cancel; refund of a whole (card) payment.
 * QPay takes amounts in tögrög; we keep hundredths.
 */
export const qpayDriver = (config: QPayConfig, options: DriverOptions = {}): GatewayDriver => {
  const base = config.sandbox
    ? 'https://merchant-sandbox.qpay.mn/v2'
    : 'https://merchant.qpay.mn/v2';
  const cacheKey = `${options.cacheKey ?? config.clientId}:${config.sandbox ? 'sandbox' : 'live'}`;
  const fetcher = () => options.fetch ?? globalThis.fetch;

  const request = async (path: string, init: RequestInit & { auth?: 'basic' } = {}) => {
    const headers = new Headers(init.headers);

    headers.set('Content-Type', 'application/json');
    headers.set(
      'Authorization',
      init.auth === 'basic'
        ? `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
        : `Bearer ${await token()}`,
    );

    const response = await fetcher()(`${base}${path}`, {
      ...init,
      headers,
      signal: AbortSignal.timeout(15_000),
    });
    const text = await response.text();

    if (!response.ok)
      throw new GatewayError(
        `QPay ${path} answered ${response.status}: ${text.slice(0, 300)}`,
        response.status,
      );

    try {
      return text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  };

  const token = async (): Promise<string> => {
    const cached = tokens.get(cacheKey);

    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.token;

    const body = await request('/auth/token', { method: 'POST', auth: 'basic' });
    const value = String(body.access_token ?? '');

    if (!value) throw new GatewayError('QPay gave no access token');

    // QPay's `expires_in` is an absolute unix time.
    const expires = Number(body.expires_in ?? 0);

    tokens.set(cacheKey, {
      token: value,
      expiresAt: expires > 1e9 ? expires * 1000 : Date.now() + 3600_000,
    });

    return value;
  };

  return {
    kind: 'qpay',
    refunds: 'full',
    async verify() {
      tokens.delete(cacheKey);
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
      const urls = Array.isArray(body.urls)
        ? (body.urls as { name?: string; logo?: string; link?: string }[])
        : [];

      if (!body.invoice_id) throw new GatewayError('QPay gave no invoice id');

      return {
        gatewayInvoiceId: String(body.invoice_id),
        payment: {
          qrText: typeof body.qr_text === 'string' ? body.qr_text : null,
          qrImage:
            typeof body.qr_image === 'string' ? `data:image/png;base64,${body.qr_image}` : null,
          shortUrl: typeof body.qPay_shortUrl === 'string' ? body.qPay_shortUrl : null,
          links: urls
            .filter((url) => url.link)
            .map((url) => ({ name: url.name ?? '', logo: url.logo ?? null, link: url.link! })),
        },
      };
    },
    async check(gatewayInvoiceId, amount) {
      const body = await request('/payment/check', {
        method: 'POST',
        body: JSON.stringify({
          object_type: 'INVOICE',
          object_id: gatewayInvoiceId,
          offset: { page_number: 1, page_limit: 100 },
        }),
      });
      const rows = Array.isArray(body.rows) ? (body.rows as QPayPaymentRow[]) : [];
      const paidRows = rows.filter((row) => !row.payment_status || row.payment_status === 'PAID');
      const fromRows = paidRows.reduce(
        (sum, row) => sum + Math.round(Number(row.payment_amount ?? 0) * 100),
        0,
      );
      const paidAmount = rows.length ? fromRows : Math.round(Number(body.paid_amount ?? 0) * 100);
      const paymentId = paidRows[0]?.payment_id;

      return {
        paid: paidAmount >= amount,
        paidAmount,
        paymentId: paymentId === undefined ? null : String(paymentId),
      };
    },
    async cancel(gatewayInvoiceId) {
      await request(`/invoice/${encodeURIComponent(gatewayInvoiceId)}`, { method: 'DELETE' });
    },
    async refund(input) {
      await request(`/payment/refund/${encodeURIComponent(input.paymentId)}`, {
        method: 'DELETE',
        body: JSON.stringify({
          note: input.note.slice(0, 255),
          ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
        }),
      });

      return { refundId: null };
    },
  };
};
