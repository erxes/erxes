import { useTeamMemberRemove } from '@/settings/team-member/hooks/useRemoveTeamMember';
import { IconTrash } from '@tabler/icons-react';
import { Command, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { Can } from 'ui-modules';

export const TeamMemberDelete = ({
  teamMemberIds,
  onCompleted,
}: {
  teamMemberIds: string[];
  onCompleted: () => void;
}) => {
  const { confirm } = useConfirm();
  const { removeTeamMember } = useTeamMemberRemove();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  return (
    <Can action="teamMembersRemove">
      <Command.Item
        className="text-destructive"
        onSelect={() =>
          confirm({
            message: `Are you sure you want to delete the ${teamMemberIds.length} selected team member?`,
          }).then(async () => {
            try {
              await removeTeamMember(teamMemberIds);
              table.setRowSelection({});
              onCompleted();
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Team member deleted successfully',
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
        <IconTrash />
        Delete
      </Command.Item>
    </Can>
  );
};
