import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const SalesSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Sales</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="sales"
            path="/deals"
            name="Deals"
          />

          <SettingsNavigationMenuLinkItem
            pathPrefix="sales"
            path="/pos"
            name="POS"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
