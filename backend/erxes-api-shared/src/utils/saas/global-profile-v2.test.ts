jest.mock('../redis', () => ({ redis: {} }));

import {
  isGlobalProfileV2,
  pluginsFromStripe,
  pluginsOfStripeItem,
} from './global-profile-v2';

const NOW = 1_800_000_000;

const pluginItem = (code: string, quantity = 1, metadata = {}) => ({
  quantity,
  metadata,
  price: { metadata: { kind: 'plugin', plugin_code: code } },
});

describe('global profile v2 plugins', () => {
  it('only treats gpStatus "new" as a v2 organization', () => {
    expect(isGlobalProfileV2({ gpStatus: 'new' })).toBe(true);
    expect(isGlobalProfileV2({ gpStatus: 'old' })).toBe(false);
    expect(isGlobalProfileV2({})).toBe(false);
    expect(isGlobalProfileV2(null)).toBe(false);
  });

  it('keeps a removed item until its ends_at, then drops it', () => {
    expect(
      pluginsOfStripeItem(
        pluginItem('sales', 0, { ends_at: String(NOW + 60) }),
        NOW,
      ),
    ).toEqual(['sales']);
    expect(
      pluginsOfStripeItem(
        pluginItem('sales', 0, { ends_at: String(NOW - 60) }),
        NOW,
      ),
    ).toEqual([]);
    expect(pluginsOfStripeItem(pluginItem('sales', 0), NOW)).toEqual([]);
  });

  it('expands bundles and reads metadata from the product when the price has none', () => {
    const bundle = {
      quantity: 1,
      price: { metadata: { kind: 'bundle', plugins: 'sales, frontline' } },
    };
    const productOnly = {
      quantity: 1,
      price: {
        metadata: {},
        product: { metadata: { kind: 'plugin', plugin_code: 'loyalty' } },
      },
    };
    expect(pluginsOfStripeItem(bundle, NOW)).toEqual(['sales', 'frontline']);
    expect(pluginsOfStripeItem(productOnly, NOW)).toEqual(['loyalty']);
  });

  it('combines free plugins with live subscriptions only', () => {
    const plugins = pluginsFromStripe(
      'payment,sales',
      [
        {
          status: 'active',
          items: { data: [pluginItem('sales'), pluginItem('loyalty')] },
        },
        { status: 'past_due', items: { data: [pluginItem('accounting')] } },
        { status: 'canceled', items: { data: [pluginItem('tourism')] } },
        {
          status: 'incomplete_expired',
          items: { data: [pluginItem('insurance')] },
        },
      ],
      NOW,
    );
    expect(plugins.sort()).toEqual([
      'accounting',
      'loyalty',
      'payment',
      'sales',
    ]);
  });
});
