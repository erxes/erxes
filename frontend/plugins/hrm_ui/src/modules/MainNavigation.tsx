import { IconHome } from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const MainNavigation = () => (
  <Sidebar.Group>
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <NavigationMenuLinkItem
          name="Нүүр"
          icon={IconHome}
          path="hrm/main"
        />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);
