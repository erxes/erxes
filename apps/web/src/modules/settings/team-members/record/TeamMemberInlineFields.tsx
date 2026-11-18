import type { User } from '@erxes/core-contract';
import { DateField } from 'erxes-ui';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';

/** Work start date cell, saved as soon as a day is picked or typed. */
export const TeamMemberWorkStartedField = ({ user }: { user: User }) => {
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);

  return (
    <DateField
      value={user.workStartedDate}
      placeholder="YYYY/MM/DD"
      disabled={!permissions?.canEdit}
      onSave={(workStartedDate) => edit.mutate({ id: user.id, workStartedDate })}
    />
  );
};
