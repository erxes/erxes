import { CellContext } from '@tanstack/react-table';
import {
  RecordTable,
  Button,
  Popover,
  Combobox,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useRemoveTag } from '../hooks/useRemoveTag';

interface TagMoreColumnCellProps {
  cell: CellContext<any, unknown>;
  clientPortalId: string;
  onEdit?: (tag: any) => void;
  onDelete?: (tagId: string) => void;
  onRefetch?: () => void;
}

export const TagMoreColumnCell = ({
  cell,
  onEdit,
  onDelete,
  onRefetch,
}: TagMoreColumnCellProps) => {
  const { _id } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTag, loading } = useRemoveTag();

  const handleEdit = () => {
    const tag = cell.row.original;
    if (onEdit) {
      onEdit(tag);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id);
    } else {
      confirm({
        message: 'Are you sure you want to delete this tag?',
      }).then(() => {
        removeTag([_id])
          .then(() => {
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Tag deleted successfully',
            });
            onRefetch?.();
          })
          .catch((e: any) => {
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

export const tagMoreColumn = (
  clientPortalId: string,
  onEdit?: (tag: any) => void,
  onDelete?: (tagId: string) => void,
  onRefetch?: () => void,
) => ({
  id: 'more',
  cell: (cell: CellContext<any, unknown>) => (
    <TagMoreColumnCell
      cell={cell}
      clientPortalId={clientPortalId}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefetch={onRefetch}
    />
  ),
  size: 20,
});
