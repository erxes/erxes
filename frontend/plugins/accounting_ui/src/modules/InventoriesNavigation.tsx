import { useTranslation } from 'react-i18next';
import { IconBucketOff, IconFlagStar, IconScale } from '@tabler/icons-react';
import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';

export const InventoriesNavigation = () => {
  const { t } = useTranslation('accounting');

  return (
    <NavigationMenuGroup name={t('inventory')}>
      <NavigationMenuLinkItem
        name={t('remainder')}
        icon={IconFlagStar}
        path="accounting/inventories/remainders"
      ></NavigationMenuLinkItem>
      <NavigationMenuLinkItem
        name={t('inventory-count')}
        icon={IconScale}
        path="accounting/inventories/safe-remainders"
      ></NavigationMenuLinkItem>
      <NavigationMenuLinkItem
        name={t('reserved-inventory')}
        icon={IconBucketOff}
        path="accounting/inventories/reserve-remainders"
      ></NavigationMenuLinkItem>
    </NavigationMenuGroup>
  );
};
