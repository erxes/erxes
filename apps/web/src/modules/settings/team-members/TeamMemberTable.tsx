import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CursorRecordTable } from '~/components/CursorRecordTable';
import { TeamMemberCommandBar } from './record/TeamMemberCommandBar';
import { teamMemberColumns } from './record/TeamMemberColumns';
import { useTeamMembers } from './useTeamMembers';

export const TeamMemberTable = () => {
  const cursor = useTeamMembers();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const columns = useMemo(() => teamMemberColumns(t), [t]);

  return (
    <CursorRecordTable
      cursor={cursor}
      columns={columns}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
      tableId="team_members_record_table"
    >
      <TeamMemberCommandBar rows={cursor.list} />
    </CursorRecordTable>
  );
};
