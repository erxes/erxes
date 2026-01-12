import { useSegments } from '@/segments/hooks/useSegments';
import { RecordTable, Spinner, PageSubHeader, RecordTableTree } from 'erxes-ui';
import { IconChartPie } from '@tabler/icons-react';
import { SegmentCommandBar } from './SegmentCommandBar';
import { SegmentDetail } from './SegmentDetail';
import columns from './SegmentsColumns';
import { useTranslation } from 'react-i18next';

export function SegmentsRecordTable() {
  const { orderedSegments, handleRefresh, loading } = useSegments();
  const { t } = useTranslation('segment');

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col h-full p-3 pt-0">
      <PageSubHeader className="p-3 mx-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <IconChartPie className="size-4" />
            <span className="font-medium">{t('segment')}</span>
          </div>
          <SegmentDetail onRefresh={handleRefresh} />
        </div>
      </PageSubHeader>
      <RecordTable.Provider
        columns={columns(t)}
        data={orderedSegments}
        stickyColumns={['checkbox', 'name']}
        className="mt-1.5"
      >
        <RecordTableTree id="segments" ordered>
          <RecordTable.Scroll>
            <RecordTable className="w-full">
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList Row={RecordTableTree.Row} />
                {loading && <RecordTable.RowSkeleton rows={40} />}
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTableTree>
        <SegmentCommandBar />
      </RecordTable.Provider>
    </div>
  );
}
