import { useTeamMemberRemove } from '@/settings/team-member/hooks/useRemoveTeamMember';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';

export const TeamMemberDelete = ({
  teamMemberIds,
  rows,
}: {
  teamMemberIds: string[];
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();
  const { removeTeamMember } = useTeamMemberRemove();

  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${teamMemberIds.length} selected team member?`,
        }).then(async () => {
          try {
            await removeTeamMember(teamMemberIds);
            rows.forEach((row) => {
              row.toggleSelected(false);
            });
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Team member deleted successfully',
            });
          } catch (e: any) {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
