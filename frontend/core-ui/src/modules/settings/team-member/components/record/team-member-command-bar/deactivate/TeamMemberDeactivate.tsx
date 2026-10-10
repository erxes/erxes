import { useTeamMemberDeactivate } from '@/settings/team-member/hooks/useTeamMemberDeactivate';
import { IUser } from '@/settings/team-member/types';
import { IconToggleLeft } from '@tabler/icons-react';
import { Command, RecordTable, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Can, currentUserState } from 'ui-modules';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

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
            message: t('confirm-deactivate-team-members', {
              count: teamMemberIds.length,
            }),
          }).then(async () => {
            try {
              await deactivateTeamMembers(teamMemberIds);
              table.setRowSelection({});
              onCompleted();
              toast({
                title: t('success'),
                variant: 'success',
                description: t('team-members-deactivated', {
                  count: teamMemberIds.length,
                }),
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
        {loading ? <Spinner size="sm" /> : <IconToggleLeft />}
        {t('deactivate')}
      </Command.Item>
    </Can>
  );
};
