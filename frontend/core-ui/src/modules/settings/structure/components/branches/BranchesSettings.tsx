import { useTranslation } from 'react-i18next';
import { useBranchesList } from '../../hooks/useBranchesList';
import { RecordTable, RecordTableTree } from 'erxes-ui';
import { BranchColumns } from './BranchColumns';
import { BranchEdit } from './details/BranchEdit';
import { BranchesFilter } from './BranchesFilter';
import { BranchesCommandBar } from './BranchesCommandBar';
import { BranchWorkingHoursSheet } from './details/BranchWorkingHoursSheet';
import { IconBuilding } from '@tabler/icons-react';
import { useStructureView } from '../../hooks/useStructureView';
import { useBranchCreateSheet } from '../../hooks/useStructureCreateSheet';
import { StructureChart } from '../chart/StructureChart';

export function BranchesSettings() {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { sortedBranches, loading } = useBranchesList();
  const { view } = useStructureView();
  const { openSheet } = useBranchCreateSheet();

  return (
    <div className="size-full overflow-hidden flex flex-col">
      <BranchEdit />
      <BranchWorkingHoursSheet />
      <BranchesFilter />
      {view === 'chart' ? (
        <StructureChart
          items={sortedBranches}
          loading={loading}
          idParam="branch_id"
          manageAction="branchesManage"
          nodeIcon={IconBuilding}
          onCreate={openSheet}
        />
      ) : (
        <RecordTable.Provider
          data={sortedBranches || []}
          columns={BranchColumns(t)}
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
      )}
    </div>
  );
}
