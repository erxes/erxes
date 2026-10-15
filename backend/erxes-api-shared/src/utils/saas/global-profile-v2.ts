import { getEnv } from '../utils';
import { redis } from '../redis';
import { IOrganization } from './types';

/*
 * Organizations created on dashboard.erxes.io (the v2 global profile) carry
 * gpStatus 'new'. Their plugins come from Stripe, not from `charge`:
 * - every item on the organization's subscriptions while it is active, trialing
 *   or past due. A removed item drops to quantity 0 but stays until the period
 *   ends; the v2 profile stamps that date on the item as `ends_at` metadata.
 * - every plugin inside a bundle item (`plugins` in the price metadata).
 * - plugins the organization has without a Stripe item (free plans, always-free
 *   plugins, admin gifts), kept in the customer's `free_plugins` metadata.
 * Organizations without gpStatus, or with 'old', are untouched.
 */

export const GP_STATUS = { OLD: 'old', NEW: 'new' } as const;

export const isGlobalProfileV2 = (
  organization?: Partial<IOrganization> | null,
): boolean => organization?.gpStatus === GP_STATUS.NEW;

const STRIPE_API = 'https://api.stripe.com/v1';
const LIVE_STATUSES = ['active', 'trialing', 'past_due'];
const FRESH_SECONDS = 60;
// Served when Stripe can't be reached, so a short outage doesn't empty workspaces.
const STALE_SECONDS = 24 * 60 * 60;

type StripeMetadata = Record<string, string | undefined>;

type StripeItem = {
  quantity?: number;
  metadata?: StripeMetadata;
  price?: {
    metadata?: StripeMetadata;
    product?: string | { metadata?: StripeMetadata; deleted?: boolean };
  };
};

type StripeSubscription = {
  status: string;
  items?: { data: StripeItem[] };
};

const list = (value?: string) =>
  (value || '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);

const stripeGet = async <T>(path: string): Promise<T> => {
  const key = getEnv({ name: 'GP2_STRIPE_SECRET_KEY' });

  if (!key) {
    throw new Error('GP2_STRIPE_SECRET_KEY is not configured');
  }

  const response = await fetch(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Stripe ${path.split('?')[0]}: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

/** Plugin codes one subscription item grants right now. */
export const pluginsOfStripeItem = (
  item: StripeItem,
  nowSeconds = Date.now() / 1000,
): string[] => {
  const endsAt = Number(item.metadata?.ends_at || 0);
  const entitled = (item.quantity ?? 0) > 0 || endsAt > nowSeconds;

  if (!entitled) {
    return [];
  }

  const product =
    typeof item.price?.product === 'object' ? item.price.product : undefined;
  const metadata = {
    ...(product?.metadata || {}),
    ...(item.price?.metadata || {}),
  };

  if (metadata.kind === 'bundle') {
    return list(metadata.plugins);
  }

  return metadata.plugin_code ? [metadata.plugin_code] : [];
};

/** Plugin codes granted by a customer's free list and live subscriptions. */
export const pluginsFromStripe = (
  freePlugins: string | undefined,
  subscriptions: StripeSubscription[],
  nowSeconds = Date.now() / 1000,
): string[] => {
  const plugins = new Set(list(freePlugins));

  for (const subscription of subscriptions) {
    if (!LIVE_STATUSES.includes(subscription.status)) {
      continue;
    }

    for (const item of subscription.items?.data || []) {
      pluginsOfStripeItem(item, nowSeconds).forEach((code) =>
        plugins.add(code),
      );
    }
  }

  return [...plugins];
};

const fetchPlugins = async (customerId: string): Promise<string[]> => {
  const customer = await stripeGet<{
    deleted?: boolean;
    metadata?: StripeMetadata;
  }>(`/customers/${encodeURIComponent(customerId)}`);

  if (customer.deleted) {
    return [];
  }

  // Prices come with each item. Stripe can't expand item products from a list
  // (more than 4 levels), so a product is fetched only when its price has no
  // plugin metadata of its own.
  const subscriptions = await stripeGet<{ data: StripeSubscription[] }>(
    `/subscriptions?customer=${encodeURIComponent(
      customerId,
    )}&status=all&limit=100`,
  );

  const products = new Map<string, { metadata?: StripeMetadata }>();

  for (const subscription of subscriptions.data) {
    for (const item of subscription.items?.data || []) {
      const price = item.price;
      const product = price?.product;

      if (price && !price.metadata?.kind && typeof product === 'string') {
        if (!products.has(product)) {
          products.set(
            product,
            await stripeGet<{ metadata?: StripeMetadata }>(
              `/products/${encodeURIComponent(product)}`,
            ),
          );
        }

        price.product = products.get(product);
      }
    }
  }

  return pluginsFromStripe(customer.metadata?.free_plugins, subscriptions.data);
};

/** Plugin codes a v2 organization may use. Cached for a minute per organization. */
export const getGlobalProfileV2Plugins = async (
  organization: Partial<IOrganization>,
): Promise<string[]> => {
  const customerId = organization.gpStripeCustomerId;

  if (!customerId) {
    return [];
  }

  const freshKey = `gp2_plugins:${customerId}`;
  const staleKey = `gp2_plugins_stale:${customerId}`;

  const cached = await redis.get(freshKey).catch(() => null);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const plugins = await fetchPlugins(customerId);
    const value = JSON.stringify(plugins);

    await Promise.all([
      redis.set(freshKey, value, 'EX', FRESH_SECONDS),
      redis.set(staleKey, value, 'EX', STALE_SECONDS),
    ]).catch(() => undefined);

    return plugins;
  } catch (error) {
    console.error(
      `[gp2] plugins for ${organization.subdomain}: ${
        (error as Error).message
      }`,
    );

    const stale = await redis.get(staleKey).catch(() => null);

    return stale ? JSON.parse(stale) : [];
  }
};
