import { IconArchive } from '@tabler/icons-react';
import { Label, RecordTable } from 'erxes-ui';
import { appsSettingsColumns } from './table/AppsSettingsColumns';
import { appsMoreColumn } from './table/AppsMoreColumn';
import { AppsCommandBar } from './AppsCommandBar';
import { useApps } from '../hooks/useApps';
import { useMemo } from 'react';

export function AppsRecordTable() {
  const { apps, loading, error } = useApps();
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
            {!loading && !error && apps.length === 0 && (
              <tr className="h-[60vh]">
                <td colSpan={6} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <IconArchive className="w-8 h-8 mb-2" />
                    <Label>No apps found</Label>
                  </div>
                </td>
              </tr>
            )}
          </RecordTable.Body>
        </RecordTable>

      </RecordTable.Scroll>
      <AppsCommandBar />
    </RecordTable.Provider>
  );
}

