import { useMemo } from 'react';
import { IconBuilding } from '@tabler/icons-react';
import { Empty, RecordTable } from 'erxes-ui';
import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { clientPortalColumns } from '@/client-portal/components/ClientPortalColumns';
import { ClientPortalCommandBar } from './client-portal-command-bar/ClientPortalCommandbar';
import { useTranslation } from 'react-i18next';

export function ClientPortalRecordTable() {
  const { clientPortals, loading, error } = useClientPortals();
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const columns = useMemo(() => clientPortalColumns(t), [t]);

  if (!loading && !error && !clientPortals?.length) {
    return (
      <Empty className="m-3 min-h-[20rem]">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconBuilding />
          </Empty.Media>
          <Empty.Title>
            {t('no-client-portals-yet', 'No client portals yet')}
          </Empty.Title>
          <Empty.Description>
            {t(
              'no-client-portals-yet-description',
              'Create a client portal to give your customers a dedicated space to interact with your business.',
            )}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      data={clientPortals || []}
      columns={columns}
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
