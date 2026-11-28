import QRCode from 'qrcode';
import { z } from 'zod';
import { type ClientOptions, GatewayError } from './types';

/** Gateways send ids and amounts as strings or numbers. */
export const Text = z.union([z.string(), z.number()]).transform(String);
export const Amount = z.union([z.string(), z.number()]).transform(Number);

/** The gateway's answer as `schema`; text that isn't JSON of that shape is a GatewayError saying what was missing. */
export const parse = <T>(gateway: string, schema: z.ZodType<T>, text: string, what: string) => {
  try {
    return schema.parse(text ? JSON.parse(text) : {});
  } catch {
    throw new GatewayError(`${gateway} gave ${what}`);
  }
};

/** A gateway's answer text, after a 2xx. */
export type Send = (path: string, init?: RequestInit) => Promise<string>;

/**
 * Requests to one gateway: JSON bodies, a 15 s timeout, no redirects, and a
 * GatewayError naming the gateway and its status on anything but a 2xx.
 */
export const gatewayHttp = (gateway: string, base: string, options: ClientOptions): Send => {
  const fetch = options.fetch ?? globalThis.fetch;

  return async (path, init = {}) => {
    const headers = new Headers(init.headers);

    if (typeof init.body === 'string' && !headers.has('Content-Type'))
      headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const response = await fetch(`${base}${path}`, {
      ...init,
      headers,
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    });

    const text = await response.text();

    if (!response.ok)
      throw new GatewayError(
        `${gateway} ${path.split('?')[0]} answered ${response.status}: ${text.slice(0, 300)}`,
        response.status,
      );

    return text;
  };
};

const tokens = new Map<string, { token: string; expiresAt: number }>();

/**
 * A gateway's access token, kept until a minute before it expires. `get`
 * answers the token and its lifetime in seconds (default an hour).
 */
export const tokenCache = (
  key: string,
  get: () => Promise<{ token: string; expiresIn?: number }>,
) => ({
  token: async () => {
    const cached = tokens.get(key);

    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.token;

    const { token, expiresIn } = await get();

    tokens.set(key, { token, expiresAt: Date.now() + (expiresIn ?? 3600) * 1000 });

    return token;
  },
  forget: () => tokens.delete(key),
});

/** `send` with the gateway's current access token as the bearer. */
export const withBearer =
  (send: Send, token: () => Promise<string>): Send =>
  async (path, init = {}) => {
    const headers = new Headers(init.headers);

    headers.set('Authorization', `Bearer ${await token()}`);

    return send(path, { ...init, headers });
  };

export const basic = (user: string, password: string) =>
  `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;

export const json = (body: unknown) => JSON.stringify(body);

/** Mongolian gateways take tögrög with up to 2 decimals; core keeps hundredths. */
export const toTugrug = (amount: number) => amount / 100;

export const fromTugrug = (amount: number) => Math.round(amount * 100);

/** The amount as the decimal text card gateways take (1250 USD → "12.50", 500 JPY → "500"). */
export const decimalAmount = (amount: number, currency: string) => {
  const digits = currencyDigits(currency);

  return (amount / 10 ** digits).toFixed(digits);
};

/** The smallest unit from a gateway's decimal text ("12.50" USD → 1250). */
export const fromDecimal = (value: string, currency: string) =>
  Math.round(Number(value) * 10 ** currencyDigits(currency));

export const currencyDigits = (currency: string) =>
  new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
    .maximumFractionDigits ?? 2;

/** What the payer scans and taps, from the text a gateway encodes in its QR. */
export const qrInstructions = async (
  qrText: string,
  links: { name: string; link: string }[] = [],
  shortUrl: string | null = null,
) => ({
  qrText,
  qrImage: await QRCode.toDataURL(qrText, { margin: 1, width: 320 }),
  shortUrl,
  links: links.map((link) => ({ ...link, logo: null })),
});

/** A page the payer opens (card gateways): its address as link and QR. */
export const pageInstructions = async (url: string, name: string) =>
  qrInstructions(url, [{ name, link: url }], url);

/** A gateway that pays in its own app after a push to the payer's phone: nothing to scan. */
export const NO_INSTRUCTIONS = { qrText: null, qrImage: null, shortUrl: null, links: [] };

/** The payer's phone as Mongolian gateways take it: 8 digits. */
export const mongolianPhone = (gateway: string, phone: string | undefined) => {
  const digits = phone?.replace(/^\+?976/, '').replace(/\D/g, '') ?? '';

  if (!/^\d{8}$/.test(digits))
    throw new GatewayError(`${gateway} needs the payer's 8-digit phone number (payerPhone)`, 400);

  return digits;
};

/** A random reference for checks that make a throwaway request. */
export const probeId = () => `probe${Date.now().toString(36)}`;
