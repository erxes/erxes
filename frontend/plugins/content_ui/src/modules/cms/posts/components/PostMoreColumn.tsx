import { IconBell, IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext } from '@tanstack/react-table';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRemovePosts } from '../hooks/useRemovePosts';
import { useSendPostNotification } from '../hooks/useSendPostNotification';
import { Posts } from '../types/postsType';

interface PostMoreColumnCellProps {
  cell: CellContext<Posts, unknown>;
  onEdit?: (post: Posts) => void;
  onDelete?: (postId: string) => void;
  onRefetch?: () => void;
}

export const PostMoreColumnCell = ({
  cell,
  onEdit,
  onDelete,
  onRefetch,
}: PostMoreColumnCellProps) => {
  const { t } = useTranslation('content');
  const post = cell.row.original;
  const { _id, status } = post;
  const isPublished = status === 'published';
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removePosts, loading: removing } = useRemovePosts();
  const { sendPostNotification, loading: sendingNotification } =
    useSendPostNotification();
  const loading = removing || sendingNotification;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post);
    } else {
      navigate(`/content/cms/posts/detail/${_id}`);
    }
  };

  const handleSendNotification = () => {
    confirm({
      message:
        'Send a notification to all client portal users about this post?',
    }).then(() => {
      sendPostNotification(_id)
        .then((result) => {
          const recipientCount = result?.recipientCount ?? 0;

          if (recipientCount === 0) {
            toast({
              title: t('no-recipients'),
              description: t('no-client-portal-users-found'),
              variant: 'warning',
            });
            return;
          }

          toast({
            title: t('notification-sent'),
            variant: 'success',
            description: t('notification-sent-to-users', { count: recipientCount }),
          });
        })
        .catch((e: Error) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id);
    } else {
      confirm({
        message: t('confirm-delete-this-post'),
      }).then(() => {
        removePosts(_id)
          .then(() => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('post-deleted-successfully'),
            });
            onRefetch?.();
          })
          .catch((e: Error) => {
            toast({
              title: t('error'),
              description: e.message,
              variant: 'destructive',
            });
          });
      });
    }
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        align="start"
        className="w-[280px] min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={handleEdit}
              >
                <IconEdit className="size-4" />
                {t('edit')}
              </Button>
            </Command.Item>
            {isPublished && (
              <Command.Item asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8"
                  onClick={handleSendNotification}
                  disabled={loading}
                >
                  <IconBell className="size-4" />
                  {t('send-notification')}
                </Button>
              </Command.Item>
            )}
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={handleDelete}
                disabled={loading}
              >
                <IconTrash className="size-4" />
                {t('delete')}
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const postMoreColumn = (
  onEdit?: (post: Posts) => void,
  onDelete?: (postId: string) => void,
  onRefetch?: () => void,
) => ({
  id: 'more',
  cell: (cell: CellContext<Posts, unknown>) => (
    <PostMoreColumnCell
      cell={cell}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefetch={onRefetch}
    />
  ),
  size: 33,
});
