import { WorkspaceRail } from '@/channels/components/settings/channel-workspace/ChannelWorkspaceFrame';
import { IntegrationNavLink } from '@/integrations/components/IntegrationNavLink';
import {
  INTEGRATIONS_CONFIG_PATH,
  TConfigProvider,
} from '@/integrations-config/hooks/useConfigProviders';
import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const IntegrationConfigNav = ({
  providers,
}: {
  providers: TConfigProvider[];
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  return (
    <WorkspaceRail
      footer={
        <p className="shrink-0 border-t px-3 py-2 text-xs text-muted-foreground">
          {t(
            'config-rail-hint',
            'Workspace-wide settings. Inboxes are connected per channel.',
          )}
        </p>
      }
    >
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('providers', 'Providers')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {providers.map((provider) => (
              <IntegrationNavLink
                key={provider.segment}
                basePath={INTEGRATIONS_CONFIG_PATH}
                path={provider.segment}
                name={provider.label}
                img={provider.img}
              />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </WorkspaceRail>
  );
};
