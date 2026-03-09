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
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();
  const { removeMembers } = useChannelMembersRemove();
  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${memberIds.length} selected members?`,
        }).then(() => {
          removeMembers(memberIds, channelId, {
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Channel members deleted successfully',
              });
            },
          });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
