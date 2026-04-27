import { PageContainer, PageSubHeader } from 'erxes-ui';
import { SyncErkhetHistoryHeader } from '@/erkhet-sync/sync-erkhet-history/components/SyncErkhetHistoryHeader';
import { SyncErkhetHistoryRecordTable } from '@/erkhet-sync/sync-erkhet-history/components/SyncErkhetHistoryRecordTable';
import { SyncErkhetHistoryFilter } from '~/modules/erkhet-sync/sync-erkhet-history/components/SyncErkhetHistoryFIlter';

export const SyncErkhetHistoryPage = () => {
  return (
    <PageContainer>
      <SyncErkhetHistoryHeader />
      <PageSubHeader>
        <SyncErkhetHistoryFilter />
      </PageSubHeader>
      <SyncErkhetHistoryRecordTable />
    </PageContainer>
  );
};
