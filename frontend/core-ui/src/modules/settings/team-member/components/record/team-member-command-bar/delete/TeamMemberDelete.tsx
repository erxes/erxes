import { useTeamMemberRemove } from '@/settings/team-member/hooks/useRemoveTeamMember';
import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const TeamMemberDelete = ({
  teamMemberIds,
}: {
  teamMemberIds: string[];
}) => {
  const { confirm } = useConfirm();
  const { removeTeamMember } = useTeamMemberRemove();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  return (
    <Can action="teamMembersRemove">
      <Button
        variant="secondary"
        className="text-destructive"
        onClick={() =>
          confirm({
            message: t('confirm-delete-selected', {
              count: teamMemberIds.length,
              defaultValue_one:
                'Are you sure you want to delete the selected team member?',
              defaultValue_other:
                'Are you sure you want to delete the {{count}} selected team members?',
            }),
          }).then(async () => {
            try {
              await removeTeamMember(teamMemberIds);
              table.setRowSelection({});
              toast({
                title: t('success', 'Success'),
                variant: 'success',
                description: t(
                  'team-member-deleted-successfully',
                  'Team member deleted successfully',
                ),
              });
            } catch (e: any) {
              toast({
                title: t('error', 'Error'),
                description: e.message,
                variant: 'destructive',
              });
            }
          })
        }
      >
        <IconTrash />
        {t('delete', 'Delete')}
      </Button>
    </Can>
  );
};
