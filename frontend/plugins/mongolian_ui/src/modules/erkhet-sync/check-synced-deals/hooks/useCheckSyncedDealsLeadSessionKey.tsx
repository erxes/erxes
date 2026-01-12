import { useLocation } from 'react-router';

import { CHECK_SYNCED_DEALS_CURSOR_SESSION_KEY } from '~/modules/erkhet-sync/check-synced-deals/constants/checkSyncedDealsCursorSessionKey';
import { CheckSyncedDealsPath } from '../types/path/checkSyncedDeals';

export const useCheckSyncedDealsLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isCheckSyncedDeals = pathname.includes(CheckSyncedDealsPath.Index);

  return {
    isCheckSyncedDeals,
    sessionKey: CHECK_SYNCED_DEALS_CURSOR_SESSION_KEY,
  };
};
