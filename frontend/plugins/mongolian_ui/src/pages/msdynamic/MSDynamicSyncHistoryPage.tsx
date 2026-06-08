import { PageSubHeader } from 'erxes-ui';
import { MSDynamicSyncHistoryFilter } from '@/msdynamic/msdynamic-sync-history/components/MSDynamicSyncHistoryFilter';
import { MSDynamicSyncHistoryRecordTable } from '~/modules/msdynamic/msdynamic-sync-history/components/MSDynamicSyncHistoryRecordTable';

export const MSDynamicSyncHistoryPage = () => {
  return (
    <>
      <PageSubHeader>
        <MSDynamicSyncHistoryFilter />
      </PageSubHeader>
      <MSDynamicSyncHistoryRecordTable />
    </>
  );
};
