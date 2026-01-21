import { MongolianPaths } from '~/types/path';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const SettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Ebarimt</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={MongolianPaths.Mongolian}
            path={MongolianPaths.MongolianSettings}
            name="Ebarimt"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
