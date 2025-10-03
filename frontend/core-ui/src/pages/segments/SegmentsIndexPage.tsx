import { useQuery } from '@apollo/client';
import { Spinner, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { SegmentsRecordTable } from '@/segments/components/SegmentRecordTable';
import { SegmentListSidebar } from '@/segments/components/SegmentsSidebar';
import { SEGMENTS_GET_TYPES } from 'ui-modules';

export default function SegmentsIndexPage() {
  const [contentType, setType] = useQueryState<string>('contentType');
  const { data, loading } = useQuery(SEGMENTS_GET_TYPES);

  useEffect(() => {
    if (!loading && data?.segmentsGetTypes?.length) {
      const [type] = data.segmentsGetTypes;
      if (type && !contentType) {
        setType(type.contentType);
      }
    }
  }, [loading, data, contentType, setType]);

  if (loading) {
    return <Spinner />;
  }

  const { segmentsGetTypes = [] } = data || {};

  return (
    <div className="flex flex-row h-full">
      <SegmentListSidebar types={segmentsGetTypes} />
      <SegmentsRecordTable />
    </div>
  );
}
