import {
  IconArrowRight,
  IconClipboardList,
  IconUserCheck,
} from '@tabler/icons-react';
import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';

export const FixedAssetsNavigation = () => {
  return (
    <NavigationMenuGroup name="Үндсэн хөрөнгө">
      <NavigationMenuLinkItem
        name="Эд хариуцагч"
        icon={IconUserCheck}
        path="accounting/fixed-assets/owner-records"
      />
      <NavigationMenuLinkItem
        name="Хөрөнгийн жагсаалт"
        icon={IconClipboardList}
        path="settings/accounting/fixed-assets/assets"
      />
      <NavigationMenuLinkItem
        name="Дотоод хөдөлгөөн"
        icon={IconArrowRight}
        path="accounting/transaction/create?defaultJournal=fxaMove"
      />
    </NavigationMenuGroup>
  );
};
