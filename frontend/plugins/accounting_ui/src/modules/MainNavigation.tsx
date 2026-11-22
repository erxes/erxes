import {
  IconClipboardTextFilled,
  IconListCheck,
  IconListDetails,
  IconRefreshAlert,
  IconReportAnalytics,
} from '@tabler/icons-react';

import { NavigationMenuLinkItem, sidebarPanelOpenState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { TransactionStatusNavigation } from '@/transactions/components/TransactionStatusNavigation';

export const MainNavigation = () => {
  const { t } = useTranslation('accounting');
  const setSidebarPanelOpen = useSetAtom(sidebarPanelOpenState);

  return (
    <>
      <NavigationMenuLinkItem
        name={t('receipts')}
        icon={IconListDetails}
        path="main"
        pathPrefix="accounting"
        action={<TransactionStatusNavigation />}
      />
      <NavigationMenuLinkItem
        name={t('journal-entries')}
        icon={IconListCheck}
        path="records"
        pathPrefix="accounting"
        onClick={() => setSidebarPanelOpen(true)}
      />
      <NavigationMenuLinkItem
        name={t('journal-reports')}
        icon={IconClipboardTextFilled}
        path="journal-reports"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name={t('tunable-reports')}
        icon={IconReportAnalytics}
        path="tunable-reports"
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
