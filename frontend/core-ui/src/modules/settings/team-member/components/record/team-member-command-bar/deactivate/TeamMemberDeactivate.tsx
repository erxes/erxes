import { useTeamMemberDeactivate } from '@/settings/team-member/hooks/useTeamMemberDeactivate';
import { IUser } from '@/settings/team-member/types';
import { IconToggleLeft } from '@tabler/icons-react';
import { Command, RecordTable, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Can, currentUserState } from 'ui-modules';

export const TeamMemberDeactivate = ({
  teamMembers,
  onCompleted,
}: {
  teamMembers: IUser[];
  onCompleted: () => void;
}) => {
  const { confirm } = useConfirm();
  const { deactivateTeamMembers, loading } = useTeamMemberDeactivate();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const currentUserId = useAtomValue(currentUserState)?._id;

  const teamMemberIds = currentUserId
    ? teamMembers
        .filter(
          (teamMember) =>
            teamMember.isActive !== false && teamMember._id !== currentUserId,
        )
        .map((teamMember) => teamMember._id)
    : [];

  return (
    <Can action="teamMembersRemove">
      <Command.Item
        disabled={loading || teamMemberIds.length === 0}
        onSelect={() =>
          confirm({
            message: `Are you sure you want to deactivate the ${teamMemberIds.length} selected team member?`,
          }).then(async () => {
            try {
              await deactivateTeamMembers(teamMemberIds);
              table.setRowSelection({});
              onCompleted();
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
      </Command.Item>
    </Can>
  );
};
