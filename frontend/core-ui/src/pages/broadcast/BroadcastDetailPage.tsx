import { BroadcastEditSheet } from '@/broadcast/components/BroadcastEditSheet';
import { BroadcastDetailSheet } from '@/broadcast/components/detail/BroadcastDetailSheet';
import { useBroadcastLiveSync } from '@/broadcast/hooks/useBroadcastChanged';
import { PageContainer } from 'erxes-ui';
import { RecordSidePanel } from 'ui-modules';

export const BroadcastDetailPage = () => {
  useBroadcastLiveSync();

  return (
    <PageContainer>
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <BroadcastDetailSheet page />
      </RecordSidePanel>
      <BroadcastEditSheet />
    </PageContainer>
  );
};
