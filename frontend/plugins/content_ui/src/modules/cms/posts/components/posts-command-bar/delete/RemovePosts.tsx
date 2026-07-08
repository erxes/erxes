import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('content');
  const { confirm } = useConfirm();
  const { removeManyPosts } = useRemovePosts();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('confirm-delete-x-posts', { count: postsIds.length }),
        }).then(() => {
          removeManyPosts(postsIds)
            .then(() => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: t('success'),
                variant: 'success',
                description: t('posts-deleted-successfully'),
              });

              onRefetch?.();
            })
            .catch((e: ApolloError) => {
              toast({
                title: t('error'),
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
