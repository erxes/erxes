import { useMemo } from 'react';
import { IconArchiveOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { OAuthClientsCommandBar } from './OAuthClientsCommandBar';
import { oauthClientsMoreColumn } from './table/OAuthClientsMoreColumn';
import { oauthClientsSettingsColumns } from './table/OAuthClientsSettingsColumns';
import { useOAuthClients } from '../hooks/useOAuthClients';
import { EmptyState } from '@/settings/components/EmptyState';
import { useTranslation } from 'react-i18next';

export function OAuthClientsRecordTable() {
  const { oauthClientApps, loading, error } = useOAuthClients();
  const { t } = useTranslation('settings', { keyPrefix: 'oauth-clients' });
  const columns = useMemo(
    () => [...oauthClientsSettingsColumns, oauthClientsMoreColumn],
    [],
  );

  const isEmpty =
    !loading && !error && (!oauthClientApps || oauthClientApps.length === 0);

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
        {isEmpty && (
          <EmptyState
            icon={IconArchiveOff}
            title={t('no-oauth-clients-found')}
            description={t('oauth-clients-description')}
          />
        )}
      </RecordTable.Scroll>
      <OAuthClientsCommandBar />
    </RecordTable.Provider>
  );
}
