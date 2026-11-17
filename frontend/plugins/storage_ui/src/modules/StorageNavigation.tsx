
  import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
  import { IconSandbox } from '@tabler/icons-react';

export const StorageNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            name="storage"
            icon={IconSandbox}
            pathPrefix="storage"
            path="storage"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
