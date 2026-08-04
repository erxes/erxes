import { useMemo } from 'react';
import { IconArchive } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { OAuthClientsCommandBar } from './OAuthClientsCommandBar';
import { oauthClientsMoreColumn } from './table/OAuthClientsMoreColumn';
import { oauthClientsSettingsColumns } from './table/OAuthClientsSettingsColumns';
import { useOAuthClients } from '../hooks/useOAuthClients';

export function OAuthClientsRecordTable() {
  const { oauthClientApps, loading, error } = useOAuthClients();
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
            {!loading && !error && oauthClientApps.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <IconArchive className="h-8 w-8 text-muted-foreground" />
                </div>

                <h3 className="text-lg font-semibold">No OAuth clients yet</h3>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  OAuth clients you create will appear here. Create your first
                  client to enable applications to authenticate with your
                  platform.
                </p>
              </div>
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <OAuthClientsCommandBar />
    </RecordTable.Provider>
  );
}
