import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const SettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Mongolian</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="mongolian"
            path="/ebarimt"
            name="Ebarimt"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="mongolian"
            path="/sync-erkhet"
            name="Erkhet"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix='mongolian'
            path='/product-places'
            name="Product Places"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
