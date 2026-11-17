
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const StorageSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">storage</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="storage/settings"
            path="storage"
            name="storage"
          />
          
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
