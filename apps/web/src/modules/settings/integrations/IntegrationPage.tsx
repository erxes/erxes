import { Navigate, useParams } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { INTEGRATIONS, integrationPath } from './catalog';
import { EbarimtIntegration } from './EbarimtIntegration';
import { EmailIntegration } from './EmailIntegration';

/**
 * Settings › Integrations › one: its page by kind. One with a settings page
 * elsewhere goes there; an unknown one goes to the catalog.
 */
export const IntegrationPage = () => {
  const { key } = useParams();
  const integration = INTEGRATIONS.find((item) => item.key === key);

  if (!useCan()('integrations.manage')) return <Navigate to={paths.settings.root} replace />;

  if (!integration) return <Navigate to={paths.settings.integrations} replace />;

  if (integration.kind === 'email') return <EmailIntegration integration={integration} />;

  if (integration.kind !== 'ebarimt') return <Navigate to={integrationPath(integration)} replace />;

  return <EbarimtIntegration integration={integration} />;
};
