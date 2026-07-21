import {
  IconShieldCheck,
  IconBuilding,
  IconPackage,
  IconAlertTriangle,
  IconUsers,
  IconMapPin,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const InsuranceNavigation = () => {
  const { t } = useTranslation('insurance');
  return (
    <div>
      <NavigationMenuLinkItem
        name={t('insurance-types', 'Insurance Types')}
        path="/insurance/types"
        icon={IconShieldCheck}
      />
      <NavigationMenuLinkItem
        name={t('products', 'Products')}
        path="/insurance/products"
        icon={IconPackage}
      />
      <NavigationMenuLinkItem
        name={t('risk-types', 'Risk Types')}
        path="/insurance/risks"
        icon={IconAlertTriangle}
      />
      <NavigationMenuLinkItem
        name={t('vendors', 'Vendors')}
        path="/insurance/vendors"
        icon={IconBuilding}
      />
      <NavigationMenuLinkItem
        name={t('vendor-users', 'Vendor Users')}
        path="/insurance/vendor-users"
        icon={IconUsers}
      />
      <NavigationMenuLinkItem
        name={t('customers', 'Customers')}
        path="/insurance/customers"
        icon={IconUsers}
      />
      <NavigationMenuLinkItem
        name={t('regions', 'Regions')}
        path="/insurance/regions"
        icon={IconMapPin}
      />
      <NavigationMenuLinkItem
        name={t('contracts', 'Contracts')}
        path="/insurance/contracts"
        icon={IconPackage}
      />
    </div>
  );
};
