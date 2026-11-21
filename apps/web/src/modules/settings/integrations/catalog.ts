import { type Icon, IconCreditCard, IconReceiptTax } from '@tabler/icons-react';
import { INTEGRATION_CATEGORIES, type TIntegrationTab, type TPluginIntegration } from 'erxes-ui';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { usePlugins } from '~/modules/plugins/usePlugins';

export const CATEGORIES = INTEGRATION_CATEGORIES;

export type Category = (typeof CATEGORIES)[number];

interface Base {
  key: string;
  /** Translated as `name.<key>`, a plugin's in its namespace. */
  name: string;
  /** One line on its tile, translated as `catalog.<key>`, a plugin's in its namespace. */
  summary: string;
  icon: Icon;
  category: Category;
  /** The countries it serves; empty: any. Others list it under other regions. */
  countries: readonly string[];
}

/**
 * The outside services core connects to for an organisation. An integration
 * set up here has its page (`IntegrationPage`, by kind); one that has its own
 * settings page elsewhere (payment gateways on Settings › Payments) links there,
 * so each is connected in one place. A new one adds an entry here. A plugin's
 * come from its `./config` (`integrations`), keyed `<plugin>.<key>`, with
 * core's header over the plugin's tabs.
 */
export type Integration =
  | (Base & { kind: 'ebarimt' })
  | (Base & { kind: 'gateways'; to: string })
  | (Base & { kind: 'plugin'; plugin: string; permission: string; tabs: TIntegrationTab[] });

const INTEGRATIONS: Integration[] = [
  {
    kind: 'ebarimt',
    key: 'ebarimt',
    name: 'eBarimt',
    summary: 'Mongolian tax receipts for paid invoices, sent through your PosAPI.',
    icon: IconReceiptTax,
    category: 'tax',
    countries: ['MN'],
  },
  {
    kind: 'gateways',
    key: 'payment-gateways',
    name: 'Payment gateways',
    summary: 'QPay, Stripe, PayPal and more: connected on Settings › Payments.',
    icon: IconCreditCard,
    category: 'payments',
    countries: [],
    to: paths.settings.payments,
  },
];

/** A plugin's tile as the catalog lists it, keyed by the plugin's name and its key. */
const pluginIntegration = (
  plugin: string,
  { key, countries = [], ...tile }: TPluginIntegration,
): Integration => ({
  ...tile,
  kind: 'plugin',
  key: `${plugin.toLowerCase()}.${key}`,
  plugin,
  countries,
});

/**
 * Core's integrations, then the installed plugins', that the member may open: gateways need
 * payments.manage, a plugin's the permission it names. `loading` until the plugin UIs have loaded.
 */
export const useIntegrations = () => {
  const { plugins, loading } = usePlugins();
  const can = useCan();

  const integrations = [
    ...INTEGRATIONS,
    ...plugins.flatMap(({ config }) =>
      config.integrations.map((tile) => pluginIntegration(config.name, tile)),
    ),
  ].filter((integration) => {
    if (integration.kind === 'gateways') return can('payments.manage');

    return integration.kind !== 'plugin' || can(integration.permission);
  });

  return { integrations, loading };
};

/** Where its tile goes: its own page, or the settings page it has elsewhere. */
export const integrationPath = (integration: Integration) =>
  integration.kind === 'gateways' ? integration.to : paths.settings.integration(integration.key);

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
