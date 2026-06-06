import { RecordTable } from 'erxes-ui';
import { appsSettingsColumns } from './table/AppsSettingsColumns';
import { appsMoreColumn } from './table/AppsMoreColumn';
import { AppsCommandBar } from './AppsCommandBar';
import { useApps } from '../hooks/useApps';
import { useMemo } from 'react';

export function AppsRecordTable() {
  const { apps, loading } = useApps();
  const columns = useMemo(() => [...appsSettingsColumns, appsMoreColumn], []);

  return (
    <RecordTable.Provider
      data={apps}
      columns={columns}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={20} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <AppsCommandBar />
    </RecordTable.Provider>
  );
}
