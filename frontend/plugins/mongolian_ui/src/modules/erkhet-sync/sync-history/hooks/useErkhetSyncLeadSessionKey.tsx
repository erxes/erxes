import { useLocation } from 'react-router';

import { ERKHET_SYNC_CURSOR_SESSION_KEY } from '~/modules/erkhet-sync/sync-history/constants/erkhetSyncHistoryCursorSessoinKey';
import { ErkhetSyncHistoryPath } from '~/modules/erkhet-sync/sync-history/types/path/erkhetSyncHistory';

export const useErkhetSyncHistorySessionKey = () => {
  const { pathname } = useLocation();

  const isHistory = pathname.includes(ErkhetSyncHistoryPath.Index);

  return {
    isHistory,
    sessionKey: ERKHET_SYNC_CURSOR_SESSION_KEY,
  };
};
