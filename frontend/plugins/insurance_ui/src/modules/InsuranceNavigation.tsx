import {
  IconShieldCheck,
  IconBuilding,
  IconPackage,
  IconAlertTriangle,
  IconUsers,
  IconFileText,
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
        name="Vendor Users"
        path="/insurance/vendor-users"
        icon={IconUsers}
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
      <NavigationMenuLinkItem
        name="Contracts"
        path="/insurance/contracts"
        icon={IconPackage}
      />
      <NavigationMenuLinkItem
        name="PDF"
        path="/insurance/contract-templates"
        icon={IconFileText}
      />
    </div>
  );
};
