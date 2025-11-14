import { useSegments } from '@/segments/hooks/useSegments';
import { IconChartPie } from '@tabler/icons-react';
import { RecordTable, RecordTableTree, Spinner } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { SegmentCommandBar } from './SegmentCommandBar';
import { SegmentDetail } from './SegmentDetail';
import columns from './SegmentsColumns';

export function SegmentsRecordTable() {
  const { orderedSegments, handleRefresh, loading } = useSegments();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col h-full p-3 pt-0">
      <PageHeader className="p-3 mx-0" separatorClassName="mb-0">
        <PageHeader.Start>
          <IconChartPie className="size-4" />
          <span className="font-medium">Segments</span>
        </PageHeader.Start>
        <PageHeader.End>
          <SegmentDetail onRefresh={handleRefresh} />
        </PageHeader.End>
      </PageHeader>
      <RecordTable.Provider
        columns={columns}
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
