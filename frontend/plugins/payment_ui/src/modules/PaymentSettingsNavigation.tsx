import { IconBuildingBank, IconCreditCard } from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const PaymentSettingsNavigation = () => {
  const { t } = useTranslation('payment');
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="payment/settings"
            path="/methods"
            name={t('payment-method')}
            icon={IconCreditCard}
          />
          <NavigationMenuLinkItem
            pathPrefix="payment/settings"
            path="corporate-gateway"
            name="Corporate Gateway"
            icon={IconBuildingBank}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
