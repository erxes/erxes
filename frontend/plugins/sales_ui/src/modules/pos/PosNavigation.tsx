import { IconCashRegister } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const PosNavigation = () => {
  const { t } = useTranslation('sales');
  return (
    <NavigationMenuLinkItem
      name={t('pos')}
      path="sales/pos"
      icon={IconCashRegister}
    />
  );
};
