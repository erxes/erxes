import { RecordTable } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { clientPortalColumns } from '@/client-portal/components/ClientPortalColumns';
import { ClientPortalAddRow } from '@/client-portal/components/ClientPortalAddRow';
import { addingClientPortalAtom } from '@/client-portal/states/addingClientPortalAtom';
import { ClientPortalCommandBar } from './client-portal-command-bar/ClientPortalCommandbar';

export function ClientPortalRecordTable() {
  const { clientPortals, loading } = useClientPortals();
  const addingClientPortal = useAtomValue(addingClientPortalAtom);
  return (
    <RecordTable.Provider
      data={clientPortals || []}
      columns={clientPortalColumns}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {addingClientPortal && <ClientPortalAddRow />}
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={30} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ClientPortalCommandBar />
    </RecordTable.Provider>
  );
}
