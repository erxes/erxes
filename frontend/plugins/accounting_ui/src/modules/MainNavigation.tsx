import {
  IconClipboardTextFilled,
  IconCrane,
  IconListCheck,
  IconListDetails,
  IconRefreshAlert,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Баримтууд"
        icon={IconListDetails}
        path="main"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name="Журнал бичилт"
        icon={IconListCheck}
        path="records"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name="Бүрэн бус баримтууд"
        icon={IconCrane}
        path="odd-transactions"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name="Тайлан"
        icon={IconClipboardTextFilled}
        path="journal-reports"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name="Мэдээ таталт"
        icon={IconRefreshAlert}
        path="check-sync"
        pathPrefix="accounting"
      />
    </>
  );
};
