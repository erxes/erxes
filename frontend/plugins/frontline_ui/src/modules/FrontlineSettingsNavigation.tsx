import {
  IconInbox,
  IconPlugConnected,
  IconUserCircle,
} from '@tabler/icons-react';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { Can } from 'ui-modules';

export const FrontlineSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="frontline/settings"
            path={FrontlinePaths.PersonalChannel}
            name="Personal channel"
            icon={IconUserCircle}
          />
          <NavigationMenuLinkItem
            pathPrefix="frontline/settings"
            path={FrontlinePaths.Channels}
            name="Channels"
            icon={IconInbox}
          />
          <Can action="integrationsEdit">
            <NavigationMenuLinkItem
              pathPrefix="frontline/settings"
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
