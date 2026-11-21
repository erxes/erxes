import type { Integration as CustomRecord, IntegrationDefinition } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { INTEGRATION_CATEGORIES } from '@erxes/core-contract/pluginIntegrations';
import {
  type Icon,
  IconApi,
  IconCreditCard,
  IconPlugConnected,
  IconReceiptTax,
} from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import type { TIntegrationTab, TPluginIntegration } from 'erxes-ui';
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
 * come from its manifest (`integrationAccounts.definitions`), keyed `<plugin>.<key>`;
 * its UI's `./config` (`integrations`) adds the mark and tabs of its own.
 */
export type Integration =
  | (Base & { kind: 'ebarimt' })
  | (Base & { kind: 'gateways'; to: string })
  | (Base & {
      kind: 'plugin';
      plugin: string;
      definition: IntegrationDefinition;
      tabs: TIntegrationTab[];
    })
  | (Base & { kind: 'custom'; record: CustomRecord });

export type PluginIntegrationEntry = Extract<Integration, { kind: 'plugin' }>;

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

const pluginIntegration = (
  definition: IntegrationDefinition,
  ui: TPluginIntegration | undefined,
): Integration => ({
  kind: 'plugin',
  key: definition.key,
  name: definition.name,
  summary: definition.summary,
  icon: ui?.icon ?? IconPlugConnected,
  category: definition.category,
  countries: definition.countries,
  plugin: definition.plugin,
  definition,
  tabs: ui?.tabs ?? [],
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
 * open: gateways need payments.manage, a plugin's the permission its manifest names (the API
 * leaves the others out), custom ones integrations.manage. `loading` until the plugins' ones and
 * their UIs have loaded, `loadingCustom` the custom ones.
 */
export const useIntegrations = () => {
  const { plugins, loading } = usePlugins();
  const can = useCan();
  const manages = can('integrations.manage');

  const custom = useQuery(orpc.integrations.list.queryOptions({ input: manages ? {} : skipToken }));

  const definitions = useQuery(
    orpc.integrationAccounts.definitions.queryOptions({ input: manages ? {} : skipToken }),
  );

  const uiOf = new Map<string, TPluginIntegration>(
    plugins.flatMap(({ config }) =>
      config.integrations.map((ui) => [`${config.name.toLowerCase()}.${ui.key}`, ui] as const),
    ),
  );

  const integrations = [
    ...INTEGRATIONS.filter(
      (integration) => integration.kind !== 'gateways' || can('payments.manage'),
    ),
    ...(definitions.data?.data ?? []).map((definition) =>
      pluginIntegration(definition, uiOf.get(definition.key)),
    ),
    ...(custom.data?.data ?? []).map(customIntegration),
  ];

  return {
    integrations,
    loading: loading || (manages && definitions.isPending),
    loadingCustom: custom.isPending,
    error: custom.error ?? definitions.error,
    refetch: () => Promise.all([custom.refetch(), definitions.refetch()]),
  };
};

/** Where its tile goes: its own page, or the settings page it has elsewhere. */
export const integrationPath = (integration: Integration) =>
  integration.kind === 'gateways' ? integration.to : paths.settings.integration(integration.key);

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
