import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SalesSettingsNavigation = () => {
  const { t } = useTranslation('sales');
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">{t('sales', 'Sales')}</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="sales"
            path="/deals"
            name={t('deals', 'Deals')}
          />

          <SettingsNavigationMenuLinkItem
            pathPrefix="sales"
            path="/pos"
            name={t('pos', 'POS')}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
