import { RecordTable } from 'erxes-ui';
import { useClientPortalUsers } from '@/contacts/client-portal-users/hooks/useClientPortalUsers';
import { clientPortalUserColumns } from '@/contacts/client-portal-users/components/ClientPortalUserColumns';
import { CP_USERS_CURSOR_SESSION_KEY } from '@/contacts/client-portal-users/constants/cpUsersCursorSessionKey';
import { Label } from 'erxes-ui';

export const ClientPortalUsersRecordTable = () => {
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
              <Label>No client portal users</Label>
            </div>
          </td>
        </tr>
      );
    }
    return <RecordTable.RowList />;
  };
  return (
    <RecordTable.Provider
      columns={clientPortalUserColumns}
      data={list}
      stickyColumns={['name']}
      className="m-3"
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
    </RecordTable.Provider>
  );
};
