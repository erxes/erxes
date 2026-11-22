import { type Integration as ListedIntegration, IntegrationCategory } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import {
  type Icon,
  IconBuildingBank,
  IconBuildingCommunity,
  IconCreditCard,
  IconMail,
  IconMessage,
  IconSocial,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { TIntegrationTab } from 'erxes-ui';
import { useCan } from '~/modules/auth/session';
import { usePlugins } from '~/modules/plugins/usePlugins';

export const CATEGORIES = IntegrationCategory.options;

export type Category = (typeof CATEGORIES)[number];

const CATEGORY_ICONS: Record<Category, Icon> = {
  payments: IconCreditCard,
  banks: IconBuildingBank,
  social: IconSocial,
  messaging: IconMessage,
  email: IconMail,
  government: IconBuildingCommunity,
};

/** A listed integration with its address (`qpay`, `frontline.facebook`) and what its UI adds. */
export type Integration = ListedIntegration & {
  slug: string;
  icon: Icon;
  tabs: TIntegrationTab[];
};

export const useMayOpenIntegrations = () => {
  const can = useCan();

  return can('integrations.manage') || can('payments.manage');
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

    return {
      ...integration,
      slug: integration.plugin ? `${integration.plugin}.${integration.key}` : integration.key,
      icon: ui?.icon ?? CATEGORY_ICONS[integration.category],
      tabs: ui?.tabs ?? [],
    };
  });

  return { integrations, loading: loading || listed.isPending, listed };
};

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
