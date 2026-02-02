import {
  SettingsNavigationMenuLinkItem,
  Sidebar,
} from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

export const PaymentSettingsNavigation = () => {
  const navigate = useNavigate();

  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Payment</Sidebar.GroupLabel>

      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>

          {/* Payment Settings */}
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path=""
            name="Payment Settings"
          />

          {/* Invoices — looks IDENTICAL */}
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="__invoices__" // fake path
            name="Invoices"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              navigate('/payment');
            }}
          />

          {/* Corporate Gateway */}
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