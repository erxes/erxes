import { useMemo } from 'react';
import { RecordTable } from 'erxes-ui';
import { OAuthClientsCommandBar } from './OAuthClientsCommandBar';
import { oauthClientsMoreColumn } from './table/OAuthClientsMoreColumn';
import { oauthClientsSettingsColumns } from './table/OAuthClientsSettingsColumns';
import { useOAuthClients } from '../hooks/useOAuthClients';

export function OAuthClientsRecordTable() {
  const { oauthClientApps, loading } = useOAuthClients();
  const columns = useMemo(
    () => [...oauthClientsSettingsColumns, oauthClientsMoreColumn],
    [],
  );

  return (
    <RecordTable.Provider
      data={oauthClientApps}
      columns={columns}
      stickyColumns={['more', 'checkbox', 'name', 'clientId']}
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
      <OAuthClientsCommandBar />
    </RecordTable.Provider>
  );
}
