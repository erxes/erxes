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
        name={t('insurance-types')}
        path="/insurance/types"
        icon={IconShieldCheck}
      />
      <NavigationMenuLinkItem
        name={t('products')}
        path="/insurance/products"
        icon={IconPackage}
      />
      <NavigationMenuLinkItem
        name={t('risk-types')}
        path="/insurance/risks"
        icon={IconAlertTriangle}
      />
      <NavigationMenuLinkItem
        name={t('vendors')}
        path="/insurance/vendors"
        icon={IconBuilding}
      />
      <NavigationMenuLinkItem
        name={t('vendor-users')}
        path="/insurance/vendor-users"
        icon={IconUsers}
      />
      <NavigationMenuLinkItem
        name={t('customers')}
        path="/insurance/customers"
        icon={IconUsers}
      />
      <NavigationMenuLinkItem
        name={t('regions')}
        path="/insurance/regions"
        icon={IconMapPin}
      />
      <NavigationMenuLinkItem
        name={t('contracts')}
        path="/insurance/contracts"
        icon={IconPackage}
      />
    </div>
  );
};
