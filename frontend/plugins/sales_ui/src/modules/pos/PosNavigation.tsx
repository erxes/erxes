import { IconCashRegister } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const PosNavigation = () => {
  return (
    <NavigationMenuLinkItem
      name="POS"
      path="pos"
      pathPrefix="sales/pos"
      icon={IconCashRegister}
    />
  );
};
