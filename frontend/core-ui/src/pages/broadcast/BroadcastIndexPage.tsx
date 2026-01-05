import { BroadcastDetailSheet } from '@/broadcast/components/BroadcastDetailSheet';
import { BroadcastFilter } from '@/broadcast/components/BroadcastFilter';
import { BroadcastHeader } from '@/broadcast/components/BroadcastHeader';
import { BroadcastRecordTable } from '@/broadcast/components/BroadcastRecordTable';
import { BroadcastStatistic } from '@/broadcast/components/BroadcastStatistic';
import { PageContainer, PageSubHeader } from 'erxes-ui';

const BroadcastIndexPage = () => {
  return (
    <PageContainer>
      <BroadcastHeader />
      <PageSubHeader>
        <BroadcastFilter />
      </PageSubHeader>

      <div className="flex overflow-hidden w-full h-full">
        <BroadcastRecordTable />
        <BroadcastStatistic />
      </div>

      <BroadcastDetailSheet />
    </PageContainer>
  );
};

export default BroadcastIndexPage;
