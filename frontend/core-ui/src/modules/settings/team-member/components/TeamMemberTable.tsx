import { RecordTable, Spinner } from 'erxes-ui';
import { useUsers } from '@/settings/team-member/hooks/useUsers';
import { teamMemberColumns } from '@/settings/team-member/components/record/TeamMemberColumns';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../constants/teamMemberCursorSessionKey';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useFields, useFieldsColumns } from 'ui-modules';
import { useUserCustomFieldEdit } from '../hooks/useUserEdit';
import { TeamMemberCommandBar } from './record/team-member-command-bar/TeamMemberCommandbar';

const TeamMemberTable = () => {
  const { users, handleFetchMore, loading, error, pageInfo } = useUsers();
  const { fields, loading: fieldsLoading } = useFields({
    contentType: 'core:user',
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const { t } = useTranslation('settings', {
    keyPrefix: 'team-member',
  });
  const columns = useMemo(() => teamMemberColumns(t), [t]);
  const teamMemberCustomFieldsColumns = useFieldsColumns({
    fields,
    mutateHook: useUserCustomFieldEdit,
  });

  if (error) {
    return (
      <div className="text-destructive">
        Error loading members: {error.message}
      </div>
    );
  }

  if (fieldsLoading) return <Spinner />;

  return (
    <RecordTable.Provider
      columns={[...columns, ...teamMemberCustomFieldsColumns]}
      data={users || []}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
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
            {loading ? (
              <RecordTable.RowSkeleton rows={40} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <TeamMemberCommandBar />
    </RecordTable.Provider>
  );
};

export { TeamMemberTable };
