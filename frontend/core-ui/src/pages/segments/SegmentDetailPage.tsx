import { SegmentDetail } from '@/segments/components/SegmentDetail';
import { PageContainer } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { RecordSidePanel, useSegmentDetail } from 'ui-modules';

export const SegmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { refetch } = useSegmentDetail(id === 'new' ? undefined : id);
  return (
    <PageContainer>
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <SegmentDetail
          page
          onRefresh={() => {
            if (id !== 'new') refetch();
          }}
        />
      </RecordSidePanel>
    </PageContainer>
  );
};
