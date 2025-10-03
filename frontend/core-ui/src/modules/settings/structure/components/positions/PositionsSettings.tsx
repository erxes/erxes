import { RecordTable, RecordTableTree } from 'erxes-ui';
import { usePositionsList } from '../../hooks/usePositionsList';
import { PositionsColumns } from './PositionsColumns';
import { PositionEdit } from './detail/PositionEdit';
import { PositionsFilter } from './PositionsFilter';
import { PositionsCommandBar } from './PositionsCommandBar';

export function PositionsSettings() {
  const { sortedPositions, loading } = usePositionsList();
  return (
    <div className="w-full overflow-hidden flex flex-col">
      <PositionEdit />
      <PositionsFilter />
      <RecordTable.Provider
        data={sortedPositions || []}
        columns={PositionsColumns}
        stickyColumns={['checkbox','code', 'title']}
        className="m-3"
      >
        <RecordTableTree id="positions-list" ordered>
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList Row={RecordTableTree.Row} />
                {loading && <RecordTable.RowSkeleton rows={30} />}
              </RecordTable.Body>
              <PositionsCommandBar />
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTableTree>
      </RecordTable.Provider>
    </div>
  );
}
