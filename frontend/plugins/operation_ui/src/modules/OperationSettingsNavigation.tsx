import { IconPlug, IconUsersGroup } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { OperationPaths } from '~/types/paths';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';

const INTEGRATION_PATHS = [
  OperationPaths.Integrations,
  OperationPaths.GithubIntegration,
  OperationPaths.DiscordIntegration,
  OperationPaths.DiscordAccount,
];

export const OperationSettingsNavigation = () => {
  const { t } = useTranslation('operation');
  const { pathname } = useLocation();
  const isIntegrationsActive = INTEGRATION_PATHS.some((path) =>
    pathname.startsWith(`/operation/settings/${path}`),
  );

  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="operation/settings"
            path={OperationPaths.TeamList}
            name={t('teams')}
            icon={IconUsersGroup}
          />
          <NavigationMenuLinkItem
            pathPrefix="operation/settings"
            path={OperationPaths.Integrations}
            name="Integrations"
            icon={IconPlug}
            isActive={isIntegrationsActive}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
