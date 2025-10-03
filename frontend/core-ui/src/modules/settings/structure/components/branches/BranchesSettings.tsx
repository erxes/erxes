import { useBranchesList } from '../../hooks/useBranchesList';
import { RecordTable, RecordTableTree } from 'erxes-ui';
import { BranchColumns } from './BranchColumns';
import { BranchEdit } from './details/BranchEdit';
import { BranchesFilter } from './BranchesFilter';
import { BranchesCommandBar } from './BranchesCommandBar';
import { BranchWorkingHoursSheet } from './details/BranchWorkingHoursSheet';

export function BranchesSettings() {
  const { sortedBranches, loading } = useBranchesList();

  return (
    <div className="size-full overflow-hidden flex flex-col">
      <BranchEdit />
      <BranchWorkingHoursSheet />
      <BranchesFilter />
      <RecordTable.Provider
        data={sortedBranches || []}
        columns={BranchColumns}
        stickyColumns={['checkbox', 'code', 'title']}
        className="m-3"
      >
        <RecordTableTree ordered id="branches-list">
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList Row={RecordTableTree.Row} />
                {loading && <RecordTable.RowSkeleton rows={30} />}
              </RecordTable.Body>
              <BranchesCommandBar />
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTableTree>
      </RecordTable.Provider>
    </div>
  );
}
