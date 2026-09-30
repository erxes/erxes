import { RecordTable } from 'erxes-ui';
import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { clientPortalColumns } from '@/client-portal/components/ClientPortalColumns';
import { ClientPortalCommandBar } from './client-portal-command-bar/ClientPortalCommandbar';
import { EmptyState } from '@/settings/components/EmptyState';
import { useTranslation } from 'react-i18next';
import { IconArchiveOff } from '@tabler/icons-react';

export function ClientPortalRecordTable() {
  const { clientPortals, loading } = useClientPortals();
  const { t } = useTranslation('settings', { keyPrefix: 'client-portal' });

  const isEmpty = !loading && (!clientPortals || clientPortals.length === 0);

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
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={30} />}
          </RecordTable.Body>
        </RecordTable>
        {isEmpty && (
          <EmptyState
            icon={IconArchiveOff}
            title={t('no-client-portal-found')}
          />
        )}
      </RecordTable.Scroll>
      <ClientPortalCommandBar />
    </RecordTable.Provider>
  );
}
