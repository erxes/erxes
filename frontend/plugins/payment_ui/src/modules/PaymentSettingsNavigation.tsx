import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const PaymentSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Payment</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="/methods"
            name="Payment"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="invoices"
            name="Invoices"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="corporate-gateway"
            name="Corporate Gateway"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
