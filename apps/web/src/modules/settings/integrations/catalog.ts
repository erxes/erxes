import {
  DecisionProvider,
  type Integration as ListedIntegration,
  IntegrationCategory,
} from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import type { TIntegrationTab } from 'erxes-ui';
import { useCan } from '~/modules/auth/session';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { initialMark, logoOf, packageUiOf } from './logos';

export const CATEGORIES = IntegrationCategory.options;

export type Category = IntegrationCategory;

const DECISION_KEYS = new Set<string>(DecisionProvider.options);

export const categoriesOf = (
  integration: Pick<ListedIntegration, 'key' | 'category' | 'plugin'>,
): Category[] =>
  !integration.plugin && DECISION_KEYS.has(integration.key) && integration.category !== 'decision'
    ? [integration.category, 'decision']
    : [integration.category];

/** A listed integration with its address (`qpay`, `frontline.meta`) and what its UI adds. */
type Listed = ListedIntegration & {
  slug: string;
  icon: ComponentType<{ className?: string }>;
  logo: boolean;
  tabs: TIntegrationTab[];
};

/** One with its tile, and the plugins' integrations that connect through it (`joined`). */
export type Integration = Listed & { joined: Listed[] };

const URGENCY = { 'not-set-up': 0, ready: 1, off: 2, connected: 3, attention: 4 } as const;

/** Its own state, unless one that joins it is in a more urgent one (a broken page). */
const statusWith = (host: Listed, joined: Listed[]): Listed['status'] => {
  const state = [host, ...joined]
    .map((item) => item.status.state)
    .reduce((most, next) => (URGENCY[next] > URGENCY[most] ? next : most));

  return { ...host.status, state };
};

/**
 * Each plugin integration that names a `connection` joins that core integration: it has no tile,
 * its tabs show on the core one's page, and its state counts towards the core one's.
 */
const joinHosts = (all: Listed[]) => {
  const hostOf = (item: Listed) =>
    item.connection ? all.find((host) => !host.plugin && host.key === item.connection) : undefined;

  return all.flatMap((item): Integration[] => {
    if (hostOf(item)) return [];

    const joined = all.filter((other) => hostOf(other) === item);

    return [{ ...item, status: statusWith(item, joined), joined }];
  });
};

/** The tab of its host's page a joined integration's `tab` shows in. */
export const joinedTab = (joined: Pick<Listed, 'slug'>, tab: string) =>
  tab.startsWith(`${joined.slug}.`) ? tab : `${joined.slug}.${tab}`;

export const useMayOpenIntegrations = () => {
  const can = useCan();

  return can('integrations.manage') || can('payments.manage') || can('assistant.manage');
};

export const useIntegrations = () => {
  const { plugins, loading } = usePlugins();
  const listed = useQuery(orpc.integrations.list.queryOptions());

  const uiOf = (plugin: string, key: string) =>
    plugins
      .find(({ config }) => config.name.toLowerCase() === plugin)
      ?.config.integrations.find((integration) => integration.key === key);

  const all = (listed.data?.data ?? []).map((integration): Listed => {
    const ui = integration.plugin ? uiOf(integration.plugin, integration.key) : undefined;
    const logo = integration.plugin ? null : logoOf(integration.key);

    return {
      ...integration,
      slug: integration.plugin ? `${integration.plugin}.${integration.key}` : integration.key,
      icon: ui?.icon ?? logo ?? initialMark(integration.name),
      logo: !ui?.icon && logo !== null,
      tabs: (integration.plugin ? ui?.tabs : packageUiOf(integration.key)?.tabs) ?? [],
    };
  });

  return { integrations: joinHosts(all), loading: loading || listed.isPending, listed };
};

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
