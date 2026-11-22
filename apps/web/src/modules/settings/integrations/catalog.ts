import {
  IntegrationCategory,
  type Integration as ListedIntegration,
  type IntegrationStatus,
} from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import {
  type Icon,
  IconBuildingBank,
  IconChecklist,
  IconCode,
  IconCreditCard,
  IconMail,
  IconMessage,
  IconReceiptTax,
  IconShoppingCart,
  IconSpeakerphone,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { TPluginIntegration } from 'erxes-ui';
import { useCan } from '~/modules/auth/session';
import { usePlugins } from '~/modules/plugins/usePlugins';

export const CATEGORIES = IntegrationCategory.options;

export type Category = IntegrationCategory;

const CATEGORY_ICONS: Record<Category, Icon> = {
  email: IconMail,
  messaging: IconMessage,
  payments: IconCreditCard,
  banks: IconBuildingBank,
  tax: IconReceiptTax,
  sales: IconShoppingCart,
  marketing: IconSpeakerphone,
  developer: IconCode,
  productivity: IconChecklist,
  social: IconUsersGroup,
};

export type CoreIntegration = ListedIntegration & { kind: 'core'; icon: Icon };

export type PluginIntegration = Omit<TPluginIntegration, 'countries'> & {
  kind: 'plugin';
  plugin: string;
  countries: readonly string[];
};

export type Integration = CoreIntegration | PluginIntegration;

const pluginIntegration = (
  plugin: string,
  { key, countries = [], ...tile }: TPluginIntegration,
): PluginIntegration => ({
  ...tile,
  kind: 'plugin',
  key: `${plugin.toLowerCase()}.${key}`,
  plugin,
  countries,
});

export const useMayOpenIntegrations = () => {
  const can = useCan();

  return can('integrations.manage') || can('payments.manage');
};

export const useIntegrations = () => {
  const { plugins, loading } = usePlugins();
  const can = useCan();
  const listed = useQuery(orpc.integrations.list.queryOptions());

  const integrations: Integration[] = [
    ...(listed.data?.data ?? []).map((integration): CoreIntegration => ({
      ...integration,
      kind: 'core',
      icon: CATEGORY_ICONS[integration.category],
    })),
    ...(can('integrations.manage')
      ? plugins.flatMap(({ config }) =>
          config.integrations
            .map((tile) => pluginIntegration(config.name, tile))
            .filter((integration) => can(integration.permission)),
        )
      : []),
  ];

  return { integrations, loading: loading || listed.isPending, listed };
};

export const statusOf = (integration: Integration): IntegrationStatus | null =>
  integration.kind === 'core' ? integration.status : null;

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
