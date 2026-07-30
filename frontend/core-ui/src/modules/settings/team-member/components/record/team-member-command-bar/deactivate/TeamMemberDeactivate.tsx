import { useTeamMemberDeactivate } from '@/settings/team-member/hooks/useTeamMemberDeactivate';
import { IUser } from '@/settings/team-member/types';
import { IconToggleLeft } from '@tabler/icons-react';
import { Button, RecordTable, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Can, currentUserState } from 'ui-modules';

export const TeamMemberDeactivate = ({
  teamMembers,
}: {
  teamMembers: IUser[];
}) => {
  const { confirm } = useConfirm();
  const { deactivateTeamMembers, loading } = useTeamMemberDeactivate();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const currentUser = useAtomValue(currentUserState);

  // Only active members can be deactivated and the backend rejects the whole
  // batch when it contains the requesting user.
  const teamMemberIds = teamMembers
    .filter(
      (teamMember) =>
        teamMember.isActive !== false && teamMember._id !== currentUser?._id,
    )
    .map((teamMember) => teamMember._id);

  return (
    <Can action="teamMembersRemove">
      <Button
        variant="secondary"
        disabled={loading || teamMemberIds.length === 0}
        onClick={() =>
          confirm({
            message: `Are you sure you want to deactivate the ${teamMemberIds.length} selected team member?`,
          }).then(async () => {
            try {
              await deactivateTeamMembers(teamMemberIds);
              table.setRowSelection({});
              toast({
                title: 'Success',
                variant: 'success',
                description: `${teamMemberIds.length} team member(s) deactivated successfully`,
              });
            } catch (error) {
              toast({
                title: 'Error',
                description:
                  error instanceof Error
                    ? error.message
                    : 'Something went wrong',
                variant: 'destructive',
              });
            }
          })
        }
      >
        {loading ? <Spinner size="sm" /> : <IconToggleLeft />}
        Deactivate
      </Button>
    </Can>
  );
};
