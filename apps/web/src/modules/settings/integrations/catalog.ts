import { type Integration as ListedIntegration, IntegrationCategory } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import type { TIntegrationTab } from 'erxes-ui';
import { useCan } from '~/modules/auth/session';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { initialMark, logoOf, packageUiOf } from './logos';

export const CATEGORIES = IntegrationCategory.options;

export type Category = IntegrationCategory;

/** A listed integration with its address (`qpay`, `frontline.facebook`) and what its UI adds. */
export type Integration = ListedIntegration & {
  slug: string;
  icon: ComponentType<{ className?: string }>;
  logo: boolean;
  tabs: TIntegrationTab[];
};

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

  const integrations = (listed.data?.data ?? []).map((integration): Integration => {
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

  return { integrations, loading: loading || listed.isPending, listed };
};

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
