import { Navigate, useParams } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { INTEGRATIONS } from './catalog';
import { EbarimtIntegration } from './EbarimtIntegration';
import { GatewayIntegration } from './GatewayIntegration';

/** Settings › Integrations › one: its page by kind; an unknown or forbidden one goes to the catalog. */
export const IntegrationPage = () => {
  const { key } = useParams();
  const can = useCan();
  const integration = INTEGRATIONS.find((item) => item.key === key);

  if (!can('integrations.manage')) return <Navigate to={paths.settings.root} replace />;

  if (!integration || (integration.kind === 'gateway' && !can('payments.manage')))
    return <Navigate to={paths.settings.integrations} replace />;

  return integration.kind === 'ebarimt' ? (
    <EbarimtIntegration integration={integration} />
  ) : (
    <GatewayIntegration integration={integration} />
  );
};
