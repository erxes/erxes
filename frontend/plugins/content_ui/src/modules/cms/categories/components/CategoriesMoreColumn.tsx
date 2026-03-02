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
import { useNavigate } from 'react-router-dom';
import { useRemoveCategories } from '../hooks/useRemoveCategories';
import { ApolloError } from '@apollo/client';

interface CategoryMoreColumnCellProps {
  cell: CellContext<any, unknown>;
  clientPortalId: string;
  onEdit?: (category: any) => void;
  onDelete?: (categoryId: string) => void;
  onRefetch?: () => void;
}

export const CategoryMoreColumnCell = ({
  cell,
  clientPortalId,
  onEdit,
  onDelete,
  onRefetch,
}: CategoryMoreColumnCellProps) => {
  const { _id } = cell.row.original;
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeSingleCategory, removeBulkCategories, loading } =
    useRemoveCategories(clientPortalId, onRefetch || (() => {}));

  const handleEdit = () => {
    const category = cell.row.original;
    if (onEdit) {
      onEdit(category);
    } else {
      navigate(`/content/cms/categories/edit/${_id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id);
    } else {
      confirm({
        message: 'Are you sure you want to delete this category?',
      }).then(() => {
        removeSingleCategory(_id)
          .then(() => {
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Category deleted successfully',
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

export const categoryMoreColumn = (
  clientPortalId: string,
  onEdit?: (category: any) => void,
  onDelete?: (categoryId: string) => void,
  onRefetch?: () => void,
) => ({
  id: 'more',
  cell: (cell: CellContext<any, unknown>) => (
    <CategoryMoreColumnCell
      cell={cell}
      clientPortalId={clientPortalId}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefetch={onRefetch}
    />
  ),
  size: 20,
});
