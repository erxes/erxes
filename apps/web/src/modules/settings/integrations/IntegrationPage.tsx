import { Navigate, useParams } from 'react-router-dom';
import { PageSpinner } from '~/components/PageSpinner';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { integrationPath, useIntegrations } from './catalog';
import { EbarimtIntegration } from './EbarimtIntegration';
import { EmailIntegration } from './EmailIntegration';
import { PluginIntegration } from './PluginIntegration';

/**
 * Settings › Integrations › one: its page by kind. One with a settings page
 * elsewhere goes there; an unknown one, or one the member may not open, goes
 * to the catalog once the plugins have loaded.
 */
export const IntegrationPage = () => {
  const { key } = useParams();
  const { integrations, loading } = useIntegrations();
  const integration = integrations.find((item) => item.key === key);

  if (!useCan()('integrations.manage')) return <Navigate to={paths.settings.root} replace />;

  if (!integration) {
    return loading ? <PageSpinner /> : <Navigate to={paths.settings.integrations} replace />;
  }

  if (integration.kind === 'email') return <EmailIntegration integration={integration} />;

  if (integration.kind === 'plugin') return <PluginIntegration integration={integration} />;

  if (integration.kind !== 'ebarimt') return <Navigate to={integrationPath(integration)} replace />;

  return <EbarimtIntegration integration={integration} />;
};
