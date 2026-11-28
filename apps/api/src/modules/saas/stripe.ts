import { ENTITLEMENT_STATUSES, PLUGIN_TIERS } from '@erxes/core-db/enums';
import type { EntitledPlugin } from '@erxes/core-db';
import { z } from 'zod';
import { config } from '~/config';

/*
 * An organisation's plugins come from its Stripe customer, as erxes 3.x core
 * reads them:
 * - every item on its subscriptions while they are active, trialing or past
 *   due. A removed item drops to quantity 0 but counts until its `ends_at`
 *   metadata (the period end erxes.io stamps on it);
 * - a plugin item's price names it (`plugin_code`, `tier`); a bundle item's
 *   names its plugins (`plugins`, each one's tier in `plugin_tiers`) and the
 *   bundle (`bundle_code`);
 * - the plugins it has without an item (free plans, always-free plugins,
 *   gifts) are in the customer's `free_plugins` metadata, their tiers in its
 *   `plugin_tiers` (Free when not named).
 * A gifted bundle is not on Stripe: erxes.io gifts its plugins, so they are in
 * `free_plugins`, and its code is nowhere.
 */

const LIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

/**
 * Bundle prices and products: `bundle` from erxes.io, `xos_bundle` from new.erxes.io, which shares
 * erxes.io's Stripe account and tags its own catalog apart so neither site reads the other's.
 */
const BUNDLE_KINDS = new Set(['bundle', 'xos_bundle']);

/** Catalog codes erxes.io sells that core knows by other plugin names. */
const CORE_PLUGINS: Record<string, string[]> = { tourism: ['tms', 'pms'] };

/** Stripe metadata: string keys and string values. */
const Metadata = z.record(z.string(), z.string()).default({});

const PluginTier = z.enum(PLUGIN_TIERS);

const Product = z.object({ metadata: Metadata });

const Item = z.object({
  quantity: z.number().nullish(),
  metadata: Metadata,
  price: z
    .object({
      metadata: Metadata,
      product: z.union([z.string(), Product]).nullish(),
    })
    .nullish(),
});

const Subscriptions = z.object({
  data: z.array(
    z.object({
      status: z.string(),
      cancel_at: z.number().nullish(),
      items: z.object({ data: z.array(Item) }).optional(),
    }),
  ),
});

const Customer = z.object({ deleted: z.boolean().optional(), metadata: Metadata });

type Item = z.infer<typeof Item>;

type Tier = EntitledPlugin['tier'];

type Status = EntitledPlugin['status'];

export interface StripeEntitlements {
  plugins: EntitledPlugin[];
  bundles: string[];
}

const stripeGet = async <T>(path: string, schema: z.ZodType<T>) => {
  const { key, url } = config.saas.stripe;

  if (!key) throw new Error('SAAS_STRIPE_SECRET_KEY is not set');

  const response = await fetch(`${url}${path}`, {
    headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Stripe ${path.split('?')[0]} answered ${response.status}`);

  return schema.parse(await response.json());
};

const list = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);

/** `sales:pro,frontline:plus` → code → tier; unknown tiers are left out. */
const tiersOf = (value: string | undefined) =>
  new Map(
    list(value).flatMap((entry) => {
      const [code = '', tier] = entry.split(':').map((part) => part.trim());
      const parsed = PluginTier.safeParse(tier);

      return parsed.success ? [[code, parsed.data] as const] : [];
    }),
  );

type Products = Map<string, z.infer<typeof Product>>;

/** The item's metadata: its price's over its product's. */
const metadataOf = (item: Item, products: Products) => {
  const product = item.price?.product;
  const fromProduct = typeof product === 'string' ? products.get(product) : product;

  return { ...fromProduct?.metadata, ...item.price?.metadata };
};

const RANKS = [
  (entry: EntitledPlugin) => PLUGIN_TIERS.indexOf(entry.tier),
  (entry: EntitledPlugin) => -ENTITLEMENT_STATUSES.indexOf(entry.status),
  (entry: EntitledPlugin) => (entry.endsAt ? Date.parse(entry.endsAt) : Number.POSITIVE_INFINITY),
];

/** The better of two grants of one plugin: the higher tier, then the livelier status, then the later end. */
const better = (a: EntitledPlugin, b: EntitledPlugin) => {
  const rank = RANKS.find((of) => of(a) !== of(b));

  return rank && rank(b) > rank(a) ? b : a;
};

const isoOf = (seconds: number) => new Date(seconds * 1000).toISOString();

/** Plugins and bundles from the customer's free list and live subscriptions, at `nowSeconds`. */
const entitlementsFrom = (
  customer: z.infer<typeof Customer>,
  subscriptions: z.infer<typeof Subscriptions>['data'],
  products: Products,
  nowSeconds: number,
): StripeEntitlements => {
  const granted = new Map<string, EntitledPlugin>();
  const bundles: string[] = [];

  const grant = (code: string, tier: Tier, status: Status, endsAt: string | null) => {
    for (const name of CORE_PLUGINS[code] ?? [code]) {
      const entry = { code: name, tier, status, endsAt };
      const had = granted.get(name);

      granted.set(name, had ? better(had, entry) : entry);
    }
  };

  const freeTiers = tiersOf(customer.metadata.plugin_tiers);

  for (const code of list(customer.metadata.free_plugins))
    grant(code, freeTiers.get(code) ?? 'free', 'active', null);

  for (const subscription of subscriptions.filter((item) => LIVE_STATUSES.has(item.status))) {
    for (const item of subscription.items?.data ?? []) {
      const quantity = item.quantity ?? 0;
      const endsAt = Number(item.metadata.ends_at || 0);

      if (quantity <= 0 && endsAt <= nowSeconds) continue;

      const ending = quantity <= 0 ? endsAt : (subscription.cancel_at ?? 0);

      const status: Status =
        subscription.status === 'past_due' ? 'past_due' : ending ? 'canceling' : 'active';

      const until = ending ? isoOf(ending) : null;
      const metadata = metadataOf(item, products);
      const bundle = metadata.bundle_code;

      if (BUNDLE_KINDS.has(metadata.kind ?? '')) {
        const tiers = tiersOf(metadata.plugin_tiers);

        for (const code of list(metadata.plugins))
          grant(code, tiers.get(code) ?? 'pro', status, until);

        if (bundle) bundles.push(...Array.from({ length: Math.max(1, quantity) }, () => bundle));
      } else if (metadata.plugin_code) {
        // A plugin price without a tier is its top one, as erxes.io reads it.
        const tier = PluginTier.safeParse(metadata.tier);

        grant(metadata.plugin_code, tier.success ? tier.data : 'pro', status, until);
      }
    }
  }

  return {
    plugins: [...granted.values()].toSorted((a, b) => a.code.localeCompare(b.code)),
    bundles: bundles.toSorted(),
  };
};

/**
 * What the Stripe customer has now (8 s per call at most). A price without
 * `kind` metadata takes it from its product, read once per product. A deleted
 * customer has nothing.
 */
export const readStripe = async (customerId: string): Promise<StripeEntitlements> => {
  const id = encodeURIComponent(customerId);
  const customer = await stripeGet(`/customers/${id}`, Customer);

  if (customer.deleted) return { plugins: [], bundles: [] };

  const { data } = await stripeGet(
    `/subscriptions?customer=${id}&status=all&limit=100`,
    Subscriptions,
  );

  const productIds = new Set(
    data.flatMap((subscription) =>
      (subscription.items?.data ?? []).flatMap((item) =>
        !item.price?.metadata.kind && typeof item.price?.product === 'string'
          ? [item.price.product]
          : [],
      ),
    ),
  );

  const products: Products = new Map(
    await Promise.all(
      [...productIds].map(
        async (product) =>
          [product, await stripeGet(`/products/${encodeURIComponent(product)}`, Product)] as const,
      ),
    ),
  );

  return entitlementsFrom(customer, data, products, Date.now() / 1000);
};
