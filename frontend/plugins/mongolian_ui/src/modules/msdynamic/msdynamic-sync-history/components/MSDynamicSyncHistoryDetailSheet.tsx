import { SyncHistoryDetailSheet } from '@/shared/sync-history/components/SyncHistoryDetailSheet';
import { IMSDynamicSyncHistory } from '../types/msDynamicSyncHistory';

export const MSDynamicSyncHistoryDetailSheet = ({
  histories,
}: {
  histories: IMSDynamicSyncHistory[];
}) => <SyncHistoryDetailSheet histories={histories} />;
