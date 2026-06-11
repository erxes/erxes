import { SyncHistoryDetailSheet } from '@/shared/sync-history/components/SyncHistoryDetailSheet';
import { ISyncHistory } from '../types/syncHistory';

export const SyncErkhetHistoryDetailSheet = ({
  histories,
}: {
  histories: ISyncHistory[];
}) => <SyncHistoryDetailSheet histories={histories} />;
