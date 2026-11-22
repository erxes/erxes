import { type CreateInvoiceInput, GatewayError } from '~/modules/integrations/gateways/types';

/** The address a `fetch` call asks for. */
export const urlOf = (input: string | URL | Request) =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

interface GatewayCall {
  method: string;
  url: string;
  body: string;
  auth: string | null;
  headers: Headers;
  redirect: RequestInit['redirect'];
}

/** The GatewayError a gateway call fails with; any other outcome fails the test. */
export const refusal = async (call: Promise<unknown>) => {
  try {
    await call;
  } catch (error) {
    if (error instanceof GatewayError) return error;

    throw error;
  }

  throw new Error('The gateway call succeeded');
};

/**
 * A fake gateway: answers each request with the reply of the first route whose
 * text the URL contains (`'POST /invoice'` also matches the method), with the
 * route's status (200 unless it names one), and keeps what was sent. An
 * unknown URL answers 404, as a real gateway would.
 */
export const fakeGateway = (routes: [string, unknown, number?][]) => {
  const calls: GatewayCall[] = [];

  const fetch = (input: string | URL | Request, init: RequestInit = {}) => {
    const url = urlOf(input);
    const method = init.method ?? 'GET';
    const headers = new Headers(init.headers);

    calls.push({
      method,
      url,
      body: typeof init.body === 'string' ? init.body : '',
      auth: headers.get('authorization'),
      headers,
      redirect: init.redirect,
    });

    const route = routes.find(([match]) => {
      const [verb, path] = match.includes(' ') ? match.split(' ') : [undefined, match];

      return (!verb || verb === method) && path !== undefined && url.includes(path);
    });

    return Promise.resolve(
      route
        ? new Response(JSON.stringify(route[1]), { status: route[2] ?? 200 })
        : new Response('{"error":"not found"}', { status: 404 }),
    );
  };

  /** The JSON body of the last call to a URL containing `path`. */
  const sent = (path: string): unknown => {
    const call = calls.findLast((item) => item.url.includes(path));

    return call?.body ? JSON.parse(call.body) : undefined;
  };

  return { fetch, calls, sent };
};

/** A ₮1,500 invoice as core opens it. */
export const tugrugInvoice: CreateInvoiceInput = {
  invoiceId: 'inv1',
  amount: 150_000,
  currency: 'MNT',
  description: 'Order #1',
  callbackUrl: 'https://erxes.test/cb/inv1/s',
  returnUrl: 'https://erxes.test/cb/inv1/s/return',
};
