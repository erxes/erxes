import { CellContext } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { Button, Popover, Combobox, Command } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useRemovePosts } from '../hooks/useRemovePosts';
import { ApolloError } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';

interface PostMoreColumnCellProps {
  cell: CellContext<any, unknown>;
  onEdit?: (post: any) => void;
  onDelete?: (postId: string) => void;
  onRefetch?: () => void;
}

export const PostMoreColumnCell = ({
  cell,
  onEdit,
  onDelete,
  onRefetch,
}: PostMoreColumnCellProps) => {
  const { _id } = cell.row.original;
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removePosts, loading } = useRemovePosts();

  const handleEdit = () => {
    const post = cell.row.original;
    if (onEdit) {
      onEdit(post);
    } else {
      navigate(`/content/cms/posts/edit/${_id}`);
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
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive h-8"
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
) => ({
  id: 'more',
  cell: (cell: CellContext<any, unknown>) => (
    <PostMoreColumnCell
      cell={cell}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefetch={onRefetch}
    />
  ),
  size: 33,
});
