import {
  PageContainer,
  Separator,
  Spinner,
  useIsMobile,
  useQueryState,
} from 'erxes-ui';
import {
  PageHeader,
  SEGMENTS_GET_TYPES,
  createFavoriteBreadcrumb,
} from 'ui-modules';

import { IconChartPie } from '@tabler/icons-react';
import { SegmentDetail } from '@/segments/components/SegmentDetail';
import { SegmentListSidebar } from '@/segments/components/SegmentsSidebar';
import { SegmentsRecordTable } from '@/segments/components/SegmentRecordTable';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useSegments } from '@/segments/hooks/useSegments';
import { useTranslation } from 'react-i18next';

export default function SegmentsIndexPage() {
  const { handleRefresh } = useSegments();
  const [contentType, setType] = useQueryState<string>('contentType');
  const isMobile = useIsMobile();
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
  const selectedSegmentType =
    segmentsGetTypes.find(
      (type: { contentType: string }) => type.contentType === contentType,
    ) || segmentsGetTypes[0];
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    'Segments',
    selectedSegmentType?.description,
  );

  return (
    <PageContainer className="flex flex-col h-full">
      <PageHeader className="p-3 mx-0">
        <PageHeader.Start>
          <IconChartPie className="size-4" />
          <span className="font-medium">{t('segment')}</span>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={favoriteBreadcrumb}
            icon="IconChartPie"
          />
        </PageHeader.Start>
        <PageHeader.End>
          <SegmentDetail onRefresh={handleRefresh} />
        </PageHeader.End>
      </PageHeader>
      <div className="flex flex-row h-full">
        {isMobile && <SegmentListSidebar types={segmentsGetTypes} />}
        <SegmentsRecordTable />
      </div>
    </PageContainer>
  );
}
