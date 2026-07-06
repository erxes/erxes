import { IconCashRegister, IconSandbox } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const MainNavigation = () => {
  const { t } = useTranslation('sales');
  return (
    <>
      <NavigationMenuLinkItem
        name={t('sales-pipeline', 'Sales Pipeline')}
        path="sales/deals"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name={t('pos', 'POS')}
        icon={IconCashRegister}
        path="sales/pos"
      />
    </>
  );
};
