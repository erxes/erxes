import { useQuery } from '@apollo/client';
import { PageContainer, Separator, Spinner, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { SegmentsRecordTable } from '@/segments/components/SegmentRecordTable';
import { SegmentListSidebar } from '@/segments/components/SegmentsSidebar';
import {
  FavoriteToggleIconButton,
  PageHeader,
  SEGMENTS_GET_TYPES,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { IconChartPie } from '@tabler/icons-react';
import { SegmentDetail } from '@/segments/components/SegmentDetail';
import { useSegments } from '@/segments/hooks/useSegments';

export default function SegmentsIndexPage() {
  const { handleRefresh } = useSegments();
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
  const { t } = useTranslation('segment');
  if (loading) {
    return <Spinner />;
  }

  const { segmentsGetTypes = [] } = data || {};

  return (
    <PageContainer className="flex flex-col h-full">
      <PageHeader className="p-3 mx-0">
        <PageHeader.Start>
          <IconChartPie className="size-4" />
          <span className="font-medium">{t('segment')}</span>
          <Separator.Inline />
          <FavoriteToggleIconButton />
        </PageHeader.Start>

        <PageHeader.End>
          <SegmentDetail onRefresh={handleRefresh} />
        </PageHeader.End>
      </PageHeader>
      <div className="flex flex-row h-full">
        <SegmentListSidebar types={segmentsGetTypes} />
        <SegmentsRecordTable />
      </div>
    </PageContainer>
  );
}
