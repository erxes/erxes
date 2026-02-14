import { useSegments } from '@/segments/hooks/useSegments';
import { RecordTable, Spinner, RecordTableTree } from 'erxes-ui';
import { SegmentCommandBar } from './SegmentCommandBar';
import columns from './SegmentsColumns';
import { useTranslation } from 'react-i18next';

export function SegmentsRecordTable() {
  const { orderedSegments, loading } = useSegments();
  const { t } = useTranslation('segment');
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col h-full p-2 pt-0">
      <RecordTable.Provider
        columns={columns(t)}
        data={orderedSegments}
        stickyColumns={['more', 'checkbox', 'name']}
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
