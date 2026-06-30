import { IconAdjustmentsCode } from '@tabler/icons-react';
import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AdjustmentNavigation = () => {
  const { t } = useTranslation('accounting');
  return (
    <NavigationMenuGroup name={t('adjustment-settings')}>
      <NavigationMenuLinkItem
        name={t('fx-rate-adjustment')}
        icon={IconAdjustmentsCode}
        path="accounting/adjustment/fundRate"
      ></NavigationMenuLinkItem>
      <NavigationMenuLinkItem
        name={t('calc-rate-adjustment')}
        icon={IconAdjustmentsCode}
        path="accounting/adjustment/debRate"
      ></NavigationMenuLinkItem>
      <NavigationMenuLinkItem
        name={t('inventory-cost-calc')}
        icon={IconAdjustmentsCode}
        path="accounting/adjustment/inventory"
      ></NavigationMenuLinkItem>
      <NavigationMenuLinkItem
        name={t('fixed-asset')}
        icon={IconAdjustmentsCode}
        path="accounting/adjustment/fxa"
      ></NavigationMenuLinkItem>
      <NavigationMenuLinkItem
        name={t('closing-entry')}
        icon={IconAdjustmentsCode}
        path="accounting/adjustment/closing"
      ></NavigationMenuLinkItem>
    </NavigationMenuGroup>
  );
};
