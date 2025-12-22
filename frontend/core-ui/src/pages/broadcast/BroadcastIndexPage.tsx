import { BroadcastFilter } from '@/broadcast/components/BroadcastFilter';
import { BroadcastHeader } from '@/broadcast/components/BroadcastHeader';
import { BroadcastRecordTable } from '@/broadcast/components/BroadcastRecordTable';
import { PageContainer, PageSubHeader } from 'erxes-ui';

const BroadcastIndexPage = () => {
  return (
    <PageContainer>
      <BroadcastHeader />
      <PageSubHeader>
        <BroadcastFilter />
      </PageSubHeader>

      <BroadcastRecordTable />
    </PageContainer>
  );
};

export default BroadcastIndexPage;
