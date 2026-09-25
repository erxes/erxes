import {
  IconInbox,
  IconPlugConnected,
  IconUserCircle,
} from '@tabler/icons-react';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const FrontlineSettingsNavigation = () => {
  const { t } = useTranslation('frontline');
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">
        {t('frontline', 'Frontline')}
      </Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline}
            path={FrontlinePaths.Channels}
            name="Channels"
            icon={IconInbox}
          />

          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline}
            path={FrontlinePaths.PersonalChannel}
            name="Personal channel"
            icon={IconUserCircle}
          />
          <Can action="integrationsEdit">
            <SettingsNavigationMenuLinkItem
              pathPrefix={FrontlinePaths.Frontline}
              path={FrontlinePaths.IntegrationConfig}
              name="Integrations Config"
              icon={IconPlugConnected}
            />
          </Can>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
