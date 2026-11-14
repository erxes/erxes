import { BroadcastEditSheet } from '@/broadcast/components/BroadcastEditSheet';
import { PageContainer } from 'erxes-ui';
import { RecordSidePanel } from 'ui-modules';

export const BroadcastEditPage = () => (
  <PageContainer>
    <RecordSidePanel expanded expandedMode="page" expandable={false}>
      <BroadcastEditSheet page />
    </RecordSidePanel>
  </PageContainer>
);
