import { IconUsersGroup } from '@tabler/icons-react';
import { PageContainer, PageSubHeader, RecordTable } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { messageOf } from '~/lib/api';
import { useSession } from '~/modules/auth/session';
import { InviteTeamMember } from './InviteTeamMember';
import { teamMembersColumns } from './teamMembersColumns';
import { TeamMembersFilter } from './TeamMembersFilter';
import { TEAM_MEMBERS_SESSION_KEY, useTeamMembers } from './useTeamMembers';

const TeamMembersRecordTable = () => {
  const { list, loading, error, hasNextPage, hasPreviousPage, handleFetchMore } = useTeamMembers();

  if (error) {
    return <div className="m-3 text-sm text-destructive">{messageOf(error)}</div>;
  }

  return (
    <RecordTable.Provider
      columns={teamMembersColumns}
      data={list}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
      tableId="core_team_members_record_table"
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list.length}
        sessionKey={TEAM_MEMBERS_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
            {loading ? <RecordTable.RowSkeleton rows={20} /> : <RecordTable.RowList />}
            <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

/** Settings › Team members: old core-ui TeamMemberPage. */
export const TeamMembersPage = () => {
  const { user } = useSession();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: 'Team members', to: '/settings/team-members', icon: IconUsersGroup }]}
          />
        </PageHeader.Start>
        <PageHeader.End>{user.role !== 'member' && <InviteTeamMember />}</PageHeader.End>
      </PageHeader>
      <PageSubHeader>
        <TeamMembersFilter />
      </PageSubHeader>
      <TeamMembersRecordTable />
    </PageContainer>
  );
};
