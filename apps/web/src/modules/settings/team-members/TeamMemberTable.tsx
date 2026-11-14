import { RecordTable } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '@erxes/core-contract/client';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from './constants';
import { TeamMemberCommandBar } from './record/TeamMemberCommandBar';
import { teamMemberColumns } from './record/TeamMemberColumns';
import { useTeamMembers } from './useTeamMembers';

export const TeamMemberTable = () => {
  const { list, loading, error, hasNextPage, hasPreviousPage, handleFetchMore } = useTeamMembers();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const columns = useMemo(() => teamMemberColumns(t), [t]);

  if (error) {
    return (
      <div className="text-destructive">
        {t('error-loading-members', { message: messageOf(error) })}
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={list}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
      tableId="team_members_record_table"
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list.length}
        sessionKey={TEAM_MEMBER_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
            {loading ? <RecordTable.RowSkeleton rows={40} /> : <RecordTable.RowList />}
            <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <TeamMemberCommandBar rows={list} />
    </RecordTable.Provider>
  );
};
