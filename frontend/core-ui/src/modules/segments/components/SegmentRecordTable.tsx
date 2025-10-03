import { useQuery } from '@apollo/client';
import { IconChartPie } from '@tabler/icons-react';
import { Spinner, useQueryState, RecordTable, RecordTableTree } from 'erxes-ui';
import { SEGMENTS, ISegment, ListQueryResponse, PageHeader } from 'ui-modules';
import { SegmentDetail } from './SegmentDetail';
import columns from './SegmentsColumns';
import { useMemo } from 'react';
import { SegmentCommandBar } from './SegmentCommandBar';

const generateOrderPath = (items: ISegment[]) => {
  const map = new Map(items.map((item) => [item._id, item]));

  const childrenMap = new Map();

  items.forEach((item) => {
    if (item.subOf) {
      if (!childrenMap.has(item.subOf)) {
        childrenMap.set(item.subOf, []);
      }
      childrenMap.get(item.subOf).push(item._id);
    }
  });

  const getOrder = (_id: string): any => {
    const item = map.get(_id);
    if (!item) return '';
    if (!item.subOf) return _id;
    return `${getOrder(item.subOf)}/${_id}`;
  };

  return items.map((item) => ({
    ...item,
    order: getOrder(item._id || ''),
    hasChildren: childrenMap.has(item._id),
  }));
};

export function SegmentsRecordTable() {
  const [selectedContentType] = useQueryState('contentType');

  const { data, loading, refetch } = useQuery<ListQueryResponse>(SEGMENTS, {
    variables: { contentTypes: [selectedContentType] },
  });

  const { segments = [] } = data || {};

  const orderedSegments = useMemo(
    () => generateOrderPath(segments),
    [segments],
  );

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
          <SegmentDetail refetch={refetch} />
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
