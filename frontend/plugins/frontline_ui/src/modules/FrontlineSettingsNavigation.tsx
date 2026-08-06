import { FrontlinePaths } from '@/types/FrontlinePaths';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { Can } from 'ui-modules';

export const FrontlineSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Frontline</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline}
            path={FrontlinePaths.Channels}
            name="Channels"
          />

          <Can action="integrationsEdit">
            <SettingsNavigationMenuLinkItem
              pathPrefix={FrontlinePaths.Frontline}
              path={FrontlinePaths.IntegrationConfig}
              name="Integrations Config"
            />
          </Can>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
