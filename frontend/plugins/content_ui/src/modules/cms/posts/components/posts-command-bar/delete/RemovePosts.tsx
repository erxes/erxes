import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useRemovePosts } from '../../../hooks/useRemovePosts';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';

export const PostsDelete = ({
  postsIds,
  rows,
  onRefetch,
}: {
  postsIds: string[];
  rows: Row<any>[];
  onRefetch?: () => void;
}) => {
  const { confirm } = useConfirm();
  const { removePosts } = useRemovePosts();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            postsIds.length
          } selected post${postsIds.length === 1 ? '' : 's'}?`,
        }).then(() => {
          Promise.all(postsIds.map((postsId) => removePosts(postsId)))
            .then(() => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Posts deleted successfully',
              });

              onRefetch?.();
            })
            .catch((e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
