import { CellContext } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { Button, Popover, Combobox, Command } from 'erxes-ui';
import { IconEdit, IconTrash, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useRemovePosts } from '../hooks/useRemovePosts';
import { ApolloError, useMutation } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';
import { POSTS_EDIT } from '../graphql/mutations/postsEditMutation';
import { useMemo, useState } from 'react';
interface PostMoreColumnCellProps {
  cell: CellContext<any, unknown>;
  onEdit?: (post: any) => void;
  onDelete?: (postId: string) => void;
  onRefetch?: () => void;
  onUpdateStatus?: (postId: string, newStatus: string) => void;
}

export const PostMoreColumnCell = ({
  cell,
  onEdit,
  onDelete,
  onRefetch,
  onUpdateStatus,
}: PostMoreColumnCellProps) => {
  const { _id, status } = cell.row.original;
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removePosts, loading } = useRemovePosts();
  const [editPost, { loading: editLoading }] = useMutation(POSTS_EDIT);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  const availableStatuses = useMemo(() => {
    if (status === 'draft') {
      return ['published', 'scheduled'];
    } else if (status === 'published') {
      return ['draft', 'scheduled'];
    } else if (status === 'scheduled') {
      return ['draft', 'published'];
    } else {
      return ['draft', 'published', 'scheduled'];
    }
  }, [status]);

  const handleStatusChange = (newStatus: string) => {
    editPost({
      variables: {
        id: _id,
        input: {
          status: newStatus,
        },
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Post status updated successfully',
          variant: 'success',
        });
        onUpdateStatus?.(_id, newStatus);
        onRefetch?.();
        setIsStatusPopoverOpen(false);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleEdit = () => {
    const post = cell.row.original;
    if (onEdit) {
      onEdit(post);
    } else {
      navigate(`/content/cms/${post.clientPortalId}/posts/detail/${_id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id);
    } else {
      confirm({
        message: 'Are you sure you want to delete this post?',
      }).then(() => {
        removePosts(_id)
          .then(() => {
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Post deleted successfully',
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
                Edit
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Popover
                open={isStatusPopoverOpen}
                onOpenChange={setIsStatusPopoverOpen}
              >
                <Popover.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8"
                  >
                    <IconClock className="size-4 mr-1" />
                    Status
                  </Button>
                </Popover.Trigger>
                <Combobox.Content
                  align="start"
                  className="w-[200px] min-w-0 [&>button]:cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Command>
                    <Command.List>
                      {availableStatuses.map((statusOption) => (
                        <Command.Item
                          key={statusOption}
                          onSelect={() => handleStatusChange(statusOption)}
                          disabled={editLoading}
                          className="w-full flex items-center gap-2 px-2 py-1"
                        >
                          {statusOption}
                        </Command.Item>
                      ))}
                    </Command.List>
                  </Command>
                </Combobox.Content>
              </Popover>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={handleDelete}
                disabled={loading}
              >
                <IconTrash className="size-4" />
                Delete
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const postMoreColumn = (
  onEdit?: (post: any) => void,
  onDelete?: (postId: string) => void,
  onRefetch?: () => void,
  onUpdateStatus?: (postId: string, newStatus: string) => void,
) => ({
  id: 'more',
  cell: (cell: CellContext<any, unknown>) => (
    <PostMoreColumnCell
      cell={cell}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefetch={onRefetch}
      onUpdateStatus={onUpdateStatus}
    />
  ),
  size: 33,
});
