import { useTranslation } from 'react-i18next';
import { RecordTable, RecordTableTree } from 'erxes-ui';
import { DepartmentColumns } from './DepartmentColumns';
import { useDepartmentsList } from '../../hooks/useDepartmentsList';
import { DepartmentEdit } from './detail/DepartmentEdit';
import { DepartmentsFilter } from './DepartmentsFilter';
import { DepartmentsCommandBar } from './DepartmentsCommandBar';
import { DepartmentWorkingHoursSheet } from './detail/DepartmentWorkingHoursSheet';
import { IconSitemap } from '@tabler/icons-react';
import { useStructureView } from '../../hooks/useStructureView';
import { useDepartmentCreateSheet } from '../../hooks/useStructureCreateSheet';
import { StructureChart } from '../chart/StructureChart';

export function DepartmentSettings() {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { sortedDepartments, loading } = useDepartmentsList();
  const { view } = useStructureView();
  const { openSheet } = useDepartmentCreateSheet();
  return (
    <div className="w-full overflow-hidden flex flex-col">
      <DepartmentEdit />
      <DepartmentWorkingHoursSheet />
      <DepartmentsFilter />
      {view === 'chart' ? (
        <StructureChart
          items={sortedDepartments}
          loading={loading}
          idParam="department_id"
          manageAction="departmentsManage"
          nodeIcon={IconSitemap}
          onCreate={openSheet}
        />
      ) : (
        <RecordTable.Provider
          data={sortedDepartments || []}
          columns={DepartmentColumns(t)}
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
      )}
    </div>
  );
}
