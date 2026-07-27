import { RecordTable, RecordTableTree } from 'erxes-ui';
import { getDepartmentColumns } from './DepartmentColumns';
import { useTranslation } from 'react-i18next';
import { useDepartmentsList } from '../../hooks/useDepartmentsList';
import { DepartmentEdit } from './detail/DepartmentEdit';
import { DepartmentsFilter } from './DepartmentsFilter';
import { DepartmentsCommandBar } from './DepartmentsCommandBar';
import { DepartmentWorkingHoursSheet } from './detail/DepartmentWorkingHoursSheet';

export function DepartmentSettings() {
  const { t } = useTranslation('settings');
  const { sortedDepartments, loading } = useDepartmentsList();
  return (
    <div className="w-full overflow-hidden flex flex-col">
      <DepartmentEdit />
      <DepartmentWorkingHoursSheet />
      <DepartmentsFilter />
      <RecordTable.Provider
        data={sortedDepartments || []}
        columns={getDepartmentColumns(t)}
        stickyColumns={['more', 'checkbox', 'code', 'title']}
        className="m-3"
      >
        <RecordTableTree id="departments-list" ordered>
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList Row={RecordTableTree.Row} />
                {loading && <RecordTable.RowSkeleton rows={30} />}
              </RecordTable.Body>
              <DepartmentsCommandBar />
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTableTree>
      </RecordTable.Provider>
    </div>
  );
}
