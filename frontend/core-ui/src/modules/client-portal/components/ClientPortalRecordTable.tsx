import { IconBuilding } from '@tabler/icons-react';
import { Empty, RecordTable } from 'erxes-ui';
import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { clientPortalColumns } from '@/client-portal/components/ClientPortalColumns';
import { ClientPortalCommandBar } from '@/client-portal/components/client-portal-command-bar/ClientPortalCommandbar';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { addingClientPortalAtom } from '@/client-portal/state';
import { ClientPortalAddRow } from '@/client-portal/components/ClientPortalAddRow';

export function ClientPortalRecordTable() {
  const { clientPortals, loading, error } = useClientPortals();
  const isAddingClientPortal = useAtomValue(addingClientPortalAtom);
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });

  const isEmpty = !loading && !error && !clientPortals?.length;

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
            {isAddingClientPortal && <ClientPortalAddRow />}
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={30} />}
          </RecordTable.Body>
        </RecordTable>

        {isEmpty && (
          <Empty className="m-3 min-h-80">
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
        )}
      </RecordTable.Scroll>
      <ClientPortalCommandBar />
    </RecordTable.Provider>
  );
}
