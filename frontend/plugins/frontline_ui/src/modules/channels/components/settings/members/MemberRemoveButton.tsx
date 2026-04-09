import { Row } from '@tanstack/table-core';
import { ApolloError } from '@apollo/client';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useChannelMembersRemove } from '@/channels/hooks/useChannelMembersRemove';

export const MemberRemoveButtonCommandBar = ({
  memberIds,
  channelId,
  rows,
}: {
  memberIds: string[];
  channelId: string;
  rows: Row<unknown>[];
}) => {
  const { confirm } = useConfirm();
  const { removeMembers } = useChannelMembersRemove();
  const { toast } = useToast();

  const handleError = (e: ApolloError) => {
    toast({
      title: 'Error',
      description: e.message,
      variant: 'destructive',
    });
  };

  const handleCompleted = () => {
    rows.forEach((row) => row.toggleSelected(false));
    toast({
      title: 'Success',
      variant: 'success',
      description: 'Channel members deleted successfully',
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
      message: `Are you sure you want to delete the ${memberIds.length} selected members?`,
    }).then(handleConfirmed);
  };

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={handleClick}
    >
      <IconTrash />
      Delete
    </Button>
  );
};
