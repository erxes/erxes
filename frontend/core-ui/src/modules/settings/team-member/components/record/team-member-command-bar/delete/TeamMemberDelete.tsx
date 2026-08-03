import { useTeamMemberRemove } from '@/settings/team-member/hooks/useRemoveTeamMember';
import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { Can } from 'ui-modules';

export const TeamMemberDelete = ({
  teamMemberIds,
}: {
  teamMemberIds: string[];
}) => {
  const { confirm } = useConfirm();
  const { removeTeamMember } = useTeamMemberRemove();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  return (
    <Can action="teamMembersRemove">
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive"
        onClick={() =>
          confirm({
            message: `Are you sure you want to delete the ${teamMemberIds.length} selected team member?`,
          }).then(async () => {
            try {
              await removeTeamMember(teamMemberIds);
              table.setRowSelection({});
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
      </Button>
    </Can>
  );
};
