import { useQuery } from '@apollo/client';
import { PageContainer, Spinner, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { SegmentsRecordTable } from '@/segments/components/SegmentRecordTable';
import { SegmentListSidebar } from '@/segments/components/SegmentsSidebar';
import { SEGMENTS_GET_TYPES, SettingsHeader } from 'ui-modules';
import { SegmentDetail } from '@/segments/components/SegmentDetail';
import { useSegments } from '@/segments/hooks/useSegments';
import { SegmentsBreadcrumb } from '@/segments/components/SegmentsBreadcrumb';

export default function SegmentsIndexPage() {
  const { handleRefresh, loading } = useSegments();
  const [contentType, setType] = useQueryState<string>('contentType');
  const { data, loading: typesLoading } = useQuery(SEGMENTS_GET_TYPES);

  useEffect(() => {
    if (!typesLoading && data?.segmentsGetTypes?.length) {
      const [type] = data.segmentsGetTypes;
      if (type && !contentType) {
        setType(type.contentType);
      }
    }
  }, [typesLoading, data, contentType, setType]);

  if (loading) {
    return <Spinner />;
  }

  const { segmentsGetTypes = [] } = data || {};

  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<SegmentsBreadcrumb />}>
        <div className="ml-auto hidden md:block">
          <SegmentDetail onRefresh={handleRefresh} />
        </div>
      </SettingsHeader>
      <div className="flex h-full overflow-hidden flex-1">
        <SegmentListSidebar types={segmentsGetTypes} />
        <SegmentsRecordTable />
      </div>
    </PageContainer>
  );
}
