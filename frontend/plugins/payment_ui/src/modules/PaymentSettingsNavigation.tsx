import {
  IconBuildingBank,
  IconCreditCard,
  IconFileInvoice,
} from '@tabler/icons-react';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const PaymentSettingsNavigation = () => {
  const { t } = useTranslation('payment');
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">{t('payment')}</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="/methods"
            name={t('payment-method')}
            icon={IconCreditCard}
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="invoices"
            name={t('invoices')}
            icon={IconFileInvoice}
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="corporate-gateway"
            name="Corporate Gateway"
            icon={IconBuildingBank}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
