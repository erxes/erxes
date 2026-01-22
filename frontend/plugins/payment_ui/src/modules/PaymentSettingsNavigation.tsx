import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const PaymentSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Payment</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="/"
            name="Payment Settings"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
