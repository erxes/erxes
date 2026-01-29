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
    pageInfo,
    totalCount,
    hasNextPage,
    hasPreviousPage,
  } = useClientPortalUsers();

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
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : !totalCount ? (
              <tr className="h-[40vh]">
                <td colSpan={7} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Label>No client portal users</Label>
                  </div>
                </td>
              </tr>
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
