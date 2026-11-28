import { vi } from 'vite-plus/test';
import { fakeGateway, urlOf } from './fakeGateway';

/** Credentials QPay's sandbox takes. */
export const QPAY_KEYS = {
  clientId: 'acme-client',
  clientSecret: 'qpay-top-secret',
  invoiceCode: 'ACME_INVOICE',
  sandbox: true,
};

/** QPay's sandbox, when all it is asked for is a token. */
export const qpayTokens = () =>
  fakeGateway([
    ['/auth/token', { access_token: 'tok', expires_in: Math.floor(Date.now() / 1000) + 3600 }],
  ]);

const realFetch = globalThis.fetch;

/** QPay's sandbox answers through `send`; every other address is reached for real. */
export const qpayAnswers = (
  send: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
) =>
  vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
    urlOf(input).startsWith('https://merchant-sandbox.qpay.mn/')
      ? send(input, init)
      : realFetch(input, init),
  );
