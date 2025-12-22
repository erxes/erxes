import {
  IconShieldCheck,
  IconBuilding,
  IconPackage,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const InsuranceNavigation = () => {
  return (
    <div>
      <NavigationMenuLinkItem
        name="Insurance Types"
        path="/insurance/types"
        icon={IconShieldCheck}
      />
      <NavigationMenuLinkItem
        name="Vendors"
        path="/insurance/vendors"
        icon={IconBuilding}
      />
      <NavigationMenuLinkItem
        name="Products"
        path="/insurance/products"
        icon={IconPackage}
      />
      <NavigationMenuLinkItem
        name="Risk Types"
        path="/insurance/risks"
        icon={IconAlertTriangle}
      />
    </div>
  );
};
