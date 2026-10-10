import { useTeamMemberRemove } from '@/settings/team-member/hooks/useRemoveTeamMember';
import { IconTrash } from '@tabler/icons-react';
import { Command, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  return (
    <Can action="teamMembersRemove">
      <Command.Item
        className="text-destructive"
        onSelect={() =>
          confirm({
            message: t('confirm-delete-team-members', {
              count: teamMemberIds.length,
            }),
          }).then(async () => {
            try {
              await removeTeamMember(teamMemberIds);
              table.setRowSelection({});
              onCompleted();
              toast({
                title: t('success'),
                variant: 'success',
                description: t('team-member-deleted'),
              });
            } catch (error) {
              toast({
                title: t('error'),
                description:
                  error instanceof Error
                    ? error.message
                    : t('something-went-wrong'),
                variant: 'destructive',
              });
            }
          })
        }
      >
        <IconTrash />
        {t('delete')}
      </Command.Item>
    </Can>
  );
};
