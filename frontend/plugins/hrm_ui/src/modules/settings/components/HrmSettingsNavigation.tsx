import { IconSettings } from '@tabler/icons-react';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const HrmSettingsNavigation = () => (
  <Sidebar.Group>
    <Sidebar.GroupLabel className="h-4">HRM</Sidebar.GroupLabel>
    <Sidebar.GroupContent className="pt-1">
      <Sidebar.Menu>
        <SettingsNavigationMenuLinkItem
          name="Тохиргоо"
          icon={IconSettings}
          path="/config"
          pathPrefix="hrm/"
        />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);
