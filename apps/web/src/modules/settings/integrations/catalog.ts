import type { Integration as CustomRecord } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { type Icon, IconApi, IconCreditCard, IconReceiptTax } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { INTEGRATION_CATEGORIES, type TIntegrationTab, type TPluginIntegration } from 'erxes-ui';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { usePlugins } from '~/modules/plugins/usePlugins';

export const CATEGORIES = [...INTEGRATION_CATEGORIES, 'custom'] as const;

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
  | (Base & { kind: 'plugin'; plugin: string; permission: string; tabs: TIntegrationTab[] })
  | (Base & { kind: 'custom'; record: CustomRecord });

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

const CUSTOM_PREFIX = 'custom.';

export const customIntegrationKey = (key: string) => `${CUSTOM_PREFIX}${key}`;

export const isCustomKey = (key: string) => key.startsWith(CUSTOM_PREFIX);

const customIntegration = (record: CustomRecord): Integration => ({
  kind: 'custom',
  key: customIntegrationKey(record.key),
  name: record.name,
  summary: record.hosts.join(', '),
  icon: IconApi,
  category: 'custom',
  countries: [],
  record,
});

/**
 * Core's integrations, then the installed plugins', then the custom ones, that the member may
 * open: gateways need payments.manage, a plugin's the permission it names, custom ones
 * integrations.manage. `loading` until the plugin UIs have loaded, `loadingCustom` the custom ones.
 */
export const useIntegrations = () => {
  const { plugins, loading } = usePlugins();
  const can = useCan();

  const custom = useQuery(
    orpc.integrations.list.queryOptions({ input: can('integrations.manage') ? {} : skipToken }),
  );

  const integrations = [
    ...INTEGRATIONS,
    ...plugins.flatMap(({ config }) =>
      config.integrations.map((tile) => pluginIntegration(config.name, tile)),
    ),
    ...(custom.data?.data ?? []).map(customIntegration),
  ].filter((integration) => {
    if (integration.kind === 'gateways') return can('payments.manage');

    return integration.kind !== 'plugin' || can(integration.permission);
  });

  return {
    integrations,
    loading,
    loadingCustom: custom.isPending,
    error: custom.error,
    refetch: custom.refetch,
  };
};

/** Where its tile goes: its own page, or the settings page it has elsewhere. */
export const integrationPath = (integration: Integration) =>
  integration.kind === 'gateways' ? integration.to : paths.settings.integration(integration.key);

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
