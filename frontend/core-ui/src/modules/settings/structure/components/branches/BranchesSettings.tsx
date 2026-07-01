import { useBranchesList } from '../../hooks/useBranchesList';
import { RecordTable, RecordTableTree } from 'erxes-ui';
import { getBranchColumns } from './BranchColumns';
import { useTranslation } from 'react-i18next';
import { BranchEdit } from './details/BranchEdit';
import { BranchesFilter } from './BranchesFilter';
import { BranchesCommandBar } from './BranchesCommandBar';
import { BranchWorkingHoursSheet } from './details/BranchWorkingHoursSheet';

export function BranchesSettings() {
  const { t } = useTranslation('settings');
  const { sortedBranches, loading } = useBranchesList();

  return (
    <div className="size-full overflow-hidden flex flex-col">
      <BranchEdit />
      <BranchWorkingHoursSheet />
      <BranchesFilter />
      <RecordTable.Provider
        data={sortedBranches || []}
        columns={getBranchColumns(t)}
        stickyColumns={['more', 'checkbox', 'code', 'title']}
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
