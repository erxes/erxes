import { RecordTable } from 'erxes-ui';
import { useUsers } from '@/settings/team-member/hooks/useUsers';
import { teamMemberColumns } from '@/settings/team-member/components/record/TeamMemberColumns';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../constants/teamMemberCursorSessionKey';

const TeamMemberTable = () => {
  const { users, handleFetchMore, loading, error, pageInfo } = useUsers();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (error) {
    return (
      <div className="text-destructive">
        Error loading members: {error.message}
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={teamMemberColumns}
      data={users || []}
      stickyColumns={['avatar', 'name']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={users?.length}
        sessionKey={TEAM_MEMBER_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

export { TeamMemberTable };
