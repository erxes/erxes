import { PageSubHeader } from 'erxes-ui';
import { SyncErkhetHistoryRecordTable } from '@/erkhet-sync/sync-erkhet-history/components/SyncErkhetHistoryRecordTable';
import { SyncErkhetHistoryFilter } from '~/modules/erkhet-sync/sync-erkhet-history/components/SyncErkhetHistoryFIlter';

export const SyncErkhetHistoryPage = () => {
  return (
    <>
      <PageSubHeader>
        <SyncErkhetHistoryFilter />
      </PageSubHeader>
      <SyncErkhetHistoryRecordTable />
    </>
  );
};
