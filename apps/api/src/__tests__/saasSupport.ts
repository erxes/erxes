import { once } from 'node:events';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { afterAll, beforeAll } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import type { useTestServer } from './support';

const PLATFORM_TOKEN = 'erxes-io-platform-token-0123456789abcdefghij';
export const HANDOFF_SECRET = 'erxes-io-jwt-token-secret-0123456789';
export const STRIPE_KEY = 'rk_test_core_reads_customers';
export const CUSTOMER = 'cus_Cloud01';

/** What erxes.io sends to create or change a workspace. */
export interface WorkspaceBody {
  organization?: { subdomain: string; name: string };
  owner?: { email: string };
  status?: string;
  stripeCustomerId?: string;
}

/** A subscription item as Stripe lists it: the price's product is its id. */
interface StripeItem {
  quantity: number;
  metadata: Record<string, string>;
  price: { metadata: Record<string, string>; product: string };
}

/** What the fake Stripe has for the customer, as erxes.io's Stripe account holds it. */
export interface StripeState {
  metadata: Record<string, string>;
  subscriptions: { status: string; items: { data: StripeItem[] } }[];
}

export const nowSeconds = () => Math.floor(Date.now() / 1000);

/** A plugin at a tier; a removed one has quantity 0 and the period end as `ends_at`. */
export const pluginItem = (
  code: string,
  tier: string,
  quantity = 1,
  endsAt?: number,
): StripeItem => ({
  quantity,
  metadata: endsAt ? { ends_at: String(endsAt) } : {},
  price: { metadata: { kind: 'plugin', plugin_code: code, tier }, product: `prod_${code}` },
});

export const bundleItem = (code: string, plugins: string, tiers: string): StripeItem => ({
  quantity: 1,
  metadata: {},
  price: {
    metadata: { kind: 'bundle', bundle_code: code, plugins, plugin_tiers: tiers },
    product: `prod_${code}`,
  },
});

/** A bundle priced before erxes.io tagged prices: its metadata is on the product only. */
export const untaggedBundle: StripeItem = {
  quantity: 1,
  metadata: {},
  price: { metadata: {}, product: 'prod_bs3' },
};

const PRODUCTS: Record<string, Record<string, string>> = {
  prod_bs3: { kind: 'bundle', bundle_code: 'business-school-3-people', plugins: 'content' },
};

export const subscribed = (status: string, ...items: StripeItem[]): StripeState => ({
  metadata: {},
  subscriptions: [{ status, items: { data: items } }],
});

const json = (res: ServerResponse, status: number, body: unknown) =>
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));

/**
 * A fake Stripe API with one customer (`CUSTOMER`), erxes.io's calls into core, and `enable()`,
 * which turns SaaS on against them. SaaS is off again after the file.
 */
export const useSaas = (server: ReturnType<typeof useTestServer>) => {
  let state: StripeState | 'down' = { metadata: {}, subscriptions: [] };
  let stripe: Server | undefined;
  let url = '';
  /** Each request core made to Stripe: its authorization and path. */
  const calls: string[] = [];

  beforeAll(async () => {
    stripe = createServer((req, res) => {
      const request = new URL(req.url ?? '/', 'http://stripe');

      calls.push(`${req.headers.authorization} ${request.pathname}${request.search}`);

      if (req.headers.authorization !== `Bearer ${STRIPE_KEY}`) return json(res, 401, {});

      if (state === 'down') return json(res, 503, {});

      if (request.pathname === `/v1/customers/${CUSTOMER}`)
        return json(res, 200, { id: CUSTOMER, metadata: state.metadata });

      if (
        request.pathname === '/v1/subscriptions' &&
        request.searchParams.get('customer') === CUSTOMER
      )
        return json(res, 200, { data: state.subscriptions, has_more: false });

      const product = PRODUCTS[request.pathname.replace('/v1/products/', '')];

      return product
        ? json(res, 200, { metadata: product })
        : json(res, 404, { error: { code: 'resource_missing' } });
    }).listen(0);
    await once(stripe, 'listening');

    const address = stripe.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    url = `http://127.0.0.1:${address.port}/v1`;
  });

  afterAll(async () => {
    Object.assign(config.saas, {
      enabled: false,
      platformToken: undefined,
      handoffSecret: undefined,
      stripe: { key: undefined, url: 'https://api.stripe.com/v1' },
    });
    stripe?.closeAllConnections();
    await new Promise<void>((resolve) => stripe?.close(() => resolve()));
  });

  /** erxes.io → core. */
  const fromErxesIo = async (
    method: string,
    path: string,
    body?: WorkspaceBody,
    token = PLATFORM_TOKEN,
  ) => {
    const response = await fetch(server.url(`/core/v1/saas${path}`), {
      method,
      headers: { ...server.headers(token), 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return {
      status: response.status,
      body: z.record(z.string(), z.unknown()).parse(await response.json()),
    };
  };

  return {
    calls,
    fromErxesIo,
    setStripe: (next: StripeState | 'down') => {
      state = next;
    },
    enable: () =>
      Object.assign(config.saas, {
        enabled: true,
        platformToken: PLATFORM_TOKEN,
        handoffSecret: HANDOFF_SECRET,
        billingUrl: 'https://erxes.io/organizations/{subdomain}/billing',
        stripe: { key: STRIPE_KEY, url },
      }),
  };
};
