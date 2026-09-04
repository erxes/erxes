import { useSegments } from '@/segments/hooks/useSegments';
import { RecordTable, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SegmentCommandBar } from './SegmentCommandBar';
import columns from './SegmentsColumns';

export function SegmentsRecordTable() {
  const { segments, loading } = useSegments();
  const { t } = useTranslation('segment');

  if (loading) {
    return <Spinner />;
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
