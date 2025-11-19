import { RecordTable } from 'erxes-ui';

import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { clientPortalColumns } from '@/client-portal/components/ClientPortalColumns';

export function ClientPortalRecordTable() {
  const { clientPortals, loading } = useClientPortals();
  return (
    <RecordTable.Provider
      data={clientPortals || []}
      columns={clientPortalColumns}
      stickyColumns={['name']}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={30} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
}
