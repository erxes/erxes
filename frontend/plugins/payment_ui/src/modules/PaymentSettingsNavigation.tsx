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
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="payment"
            path="invoices"
            name={t('invoices')}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
