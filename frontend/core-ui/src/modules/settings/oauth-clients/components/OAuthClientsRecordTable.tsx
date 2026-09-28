import { useMemo } from 'react';
import { IconShieldLock } from '@tabler/icons-react';
import { Empty, RecordTable } from 'erxes-ui';
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

  if (!loading && !error && oauthClientApps.length === 0) {
    return (
      <Empty className="m-3 min-h-[20rem]">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconShieldLock />
          </Empty.Media>
          <Empty.Title>No OAuth clients yet</Empty.Title>
          <Empty.Description>
            OAuth clients you create will appear here. Create your first client
            to enable applications to authenticate with your platform.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

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
