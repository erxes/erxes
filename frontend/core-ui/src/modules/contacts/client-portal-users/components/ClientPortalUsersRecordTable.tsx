import { useTranslation } from 'react-i18next';
import { ClientPortalUsersCommandBar } from '@/contacts/client-portal-users/components/client-portal-users-command-bar/ClientPortalUsersCommandBar';
import { clientPortalUserColumns } from '@/contacts/client-portal-users/components/ClientPortalUserColumns';
import { CP_USERS_CURSOR_SESSION_KEY } from '@/contacts/client-portal-users/constants/cpUsersCursorSessionKey';
import { useClientPortalUsers } from '@/contacts/client-portal-users/hooks/useClientPortalUsers';
import { Label, RecordTable } from 'erxes-ui';
import { useMemo } from 'react';

export const ClientPortalUsersRecordTable = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  const columns = useMemo(() => clientPortalUserColumns(t), [t]);
  const {
    list,
    handleFetchMore,
    loading,
    totalCount,
    hasNextPage,
    hasPreviousPage,
  } = useClientPortalUsers();
  const RecordMain = () => {
    if (loading) {
      return <RecordTable.RowSkeleton rows={32} />;
    }
    if (!totalCount) {
      return (
        <tr className="h-[40vh]">
          <td colSpan={9} className="py-10 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Label>{t('no-users')}</Label>
            </div>
          </td>
        </tr>
      );
    }
    return <RecordTable.RowList />;
  };
  return (
    <RecordTable.Provider
      columns={columns}
      data={list}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
      tableId="client_portal_users_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list?.length}
        sessionKey={CP_USERS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            <RecordMain />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <ClientPortalUsersCommandBar />
    </RecordTable.Provider>
  );
};
