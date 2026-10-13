import { useSegments } from '@/segments/hooks/useSegments';
import { RecordTable, Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SegmentCommandBar } from './SegmentCommandBar';
import { SegmentEmptyState, SegmentErrorState } from './SegmentStates';
import columns from './SegmentsColumns';

export function SegmentsRecordTable() {
  const { segments, loading, error, refetch } = useSegments();
  const { t } = useTranslation('segment');

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <SegmentErrorState
        error={error}
        onRetry={() =>
          refetch().catch(() =>
            toast({ title: t('error-description'), variant: 'destructive' }),
          )
        }
      />
    );
  }

  if (segments.length === 0) {
    return <SegmentEmptyState />;
  }

  return (
    <div className="flex flex-col h-full p-2 pt-0">
      {/* Segments no longer nest under one another, so the list is flat rather
          than a tree keyed on `order`. */}
      <RecordTable.Provider
        columns={columns(t)}
        data={segments}
        stickyColumns={['more', 'checkbox', 'name']}
        className="mt-1.5"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {loading && <RecordTable.RowSkeleton rows={40} />}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
        <SegmentCommandBar />
      </RecordTable.Provider>
    </div>
  );
}
