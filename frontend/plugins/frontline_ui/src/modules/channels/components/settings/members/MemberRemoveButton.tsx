import { useChannelMembersRemove } from '@/channels/hooks/useChannelMembersRemove';
import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MemberRemoveButtonCommandBar = ({
  memberIds,
  channelId,
}: {
  memberIds: string[];
  channelId: string;
}) => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeMembers, loading } = useChannelMembersRemove();

  const handleClick = () =>
    confirm({
      message: t('confirm-delete-selected-members', {
        defaultValue:
          'Are you sure you want to delete the {{count}} selected members?',
        count: memberIds.length,
      }),
    }).then(async () => {
      const { removedIds, failedCount, error, refreshFailed } =
        await removeMembers(memberIds, channelId);

      table.resetRowSelection();

      const description = [
        failedCount
          ? t('channel-members-removed-with-failures', {
              defaultValue: '{{succeeded}} removed, {{failed}} failed',
              succeeded: removedIds.length,
              failed: failedCount,
            })
          : t('channel-members-deleted', {
              defaultValue: 'Channel members deleted successfully',
            }),
        failedCount && error?.message,
        refreshFailed &&
          t('channel-members-refresh-failed', {
            defaultValue:
              'Could not refresh the list. Reload the page to see the latest data.',
          }),
      ]
        .filter(Boolean)
        .join(' ');

      return toast(
        failedCount || refreshFailed
          ? { title: t('error', 'Error'), description, variant: 'destructive' }
          : {
              title: t('success', 'Success!'),
              description,
              variant: 'success',
            },
      );
    });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? <Spinner size="sm" /> : <IconTrash />}
      {t('delete', 'Delete')}
    </Button>
  );
};
