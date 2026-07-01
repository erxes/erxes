import { RecordTable } from 'erxes-ui';
import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { getClientPortalColumns } from '@/client-portal/components/ClientPortalColumns';
import { ClientPortalCommandBar } from './client-portal-command-bar/ClientPortalCommandbar';
import { useTranslation } from 'react-i18next';

export function ClientPortalRecordTable() {
  const { t } = useTranslation('client-portal');
  const { clientPortals, loading } = useClientPortals();
  return (
    <RecordTable.Provider
      data={clientPortals || []}
      columns={getClientPortalColumns(t)}
      stickyColumns={['more', 'checkbox', 'name']}
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
      <ClientPortalCommandBar />
    </RecordTable.Provider>
  );
}
