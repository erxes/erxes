import { Row } from '@tanstack/table-core';
import { ApolloError } from '@apollo/client';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useChannelMembersRemove } from '@/channels/hooks/useChannelMembersRemove';
import { useTranslation } from 'react-i18next';

export const MemberRemoveButtonCommandBar = ({
  memberIds,
  channelId,
  rows,
}: {
  memberIds: string[];
  channelId: string;
  rows: Row<unknown>[];
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { removeMembers } = useChannelMembersRemove();
  const { toast } = useToast();

  const handleError = (e: ApolloError) => {
    toast({
      title: t('error'),
      description: e.message,
      variant: 'destructive',
    });
  };

  const handleCompleted = () => {
    rows.forEach((row) => row.toggleSelected(false));
    toast({
      title: t('success'),
      variant: 'success',
      description: t('channel-members-deleted'),
    });
  };

  const handleConfirmed = () => {
    removeMembers(memberIds, channelId, {
      onError: handleError,
      onCompleted: handleCompleted,
    });
  };

  const handleClick = () => {
    confirm({
      message: t('confirm-delete-selected-members', { count: memberIds.length }),
    }).then(handleConfirmed);
  };

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={handleClick}
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
