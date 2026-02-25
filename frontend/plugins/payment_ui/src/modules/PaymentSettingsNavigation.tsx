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
           <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="invoices" 
            name="Invoices"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
