import {
  IconClipboardTextFilled,
  IconCrane,
  IconListCheck,
  IconListDetails,
  IconRefreshAlert,
} from '@tabler/icons-react';

import { NavigationMenuLinkItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MainNavigation = () => {
  const { t } = useTranslation('accounting');
  return (
    <>
      <NavigationMenuLinkItem
        name={t('receipts')}
        icon={IconListDetails}
        path="main"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name={t('journal-entries')}
        icon={IconListCheck}
        path="records"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name={t('incomplete-vouchers')}
        icon={IconCrane}
        path="odd-transactions"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name={t('report')}
        icon={IconClipboardTextFilled}
        path="journal-reports"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name={t('check-sync')}
        icon={IconRefreshAlert}
        path="check-sync"
        pathPrefix="accounting"
      />
    </>
  );
};
