import { useLocation } from 'react-router';

import { SYNC_HISTORIES_CURSOR_SESSION_KEY } from '~/modules/erkhet-sync/sync-erkhet-history/constants/syncErkhetHistoryCursorSessoinKey';
import { ErkhetSyncHistoryPath } from '~/modules/erkhet-sync/sync-erkhet-history/types/path/erkhetSyncHistory';

export const useSyncErkhetHistoryLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isHistory = pathname.includes(ErkhetSyncHistoryPath.Index);

  return {
    isHistory,
    sessionKey: SYNC_HISTORIES_CURSOR_SESSION_KEY,
  };
};
