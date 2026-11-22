import { Spinner } from 'erxes-ui';
import { type ReactNode, Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PageSpinner } from '~/components/PageSpinner';
import { paths } from '~/lib/paths';
import { type Integration, useIntegrations, useMayOpenIntegrations } from './catalog';
import { ConnectionsIntegration } from './ConnectionsIntegration';
import { BanksIntegration } from './banks/BanksIntegration';
import { EbarimtIntegration } from './EbarimtIntegration';
import { PluginIntegration } from './PluginIntegration';

const OWN_PAGES = new Map<string, (integration: Integration) => ReactNode>([
  ['ebarimt', (integration) => <EbarimtIntegration integration={integration} />],
  ...['khanbank-cgw', 'golomt-cgw', 'tdb-cgw'].map(
    (key) =>
      [key, (integration: Integration) => <BanksIntegration integration={integration} />] as const,
  ),
]);

const KeyedPage = ({ slug }: { slug: string | undefined }) => {
  const { integrations, loading } = useIntegrations();
  const integration = integrations.find((item) => item.slug === slug);

  if (!integration) {
    return loading ? <PageSpinner /> : <Navigate to={paths.settings.integrations} replace />;
  }

  if (integration.plugin) {
    return <PluginIntegration integration={integration} plugin={integration.plugin} />;
  }

  const ownPage = OWN_PAGES.get(integration.key);

  return ownPage ? (
    ownPage(integration)
  ) : (
    <ConnectionsIntegration
      integration={integration}
      tabs={integration.tabs.map(({ value, label, component: Content }) => ({
        value,
        label,
        content: (
          <Suspense fallback={<Spinner />}>
            <Content />
          </Suspense>
        ),
      }))}
    />
  );
};

/**
 * Settings › Integrations › one: a plugin's tabs, the page an integration has of its own, or
 * its connections. An unknown one, or one the member may not open, goes to the catalog.
 */
export const IntegrationPage = () => {
  const { key } = useParams();

  if (!useMayOpenIntegrations()) return <Navigate to={paths.settings.root} replace />;

  return <KeyedPage slug={key} />;
};
