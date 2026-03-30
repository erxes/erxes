import { useState } from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { ICategory } from '../types/category';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import { CategoryEditSheet } from './CategoryEditSheet';

export const CategoryMoreColumn = (
  props: CellContext<ICategory & { hasChildren: boolean }, unknown>,
) => {
  const category = props.row.original;
  const [editOpen, setEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const deleteCategory = useDeleteCategory();

  const handleEdit = () => {
    setEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this category?',
      options: { confirmationValue: 'delete' },
    })
      .then(() => {
        deleteCategory({ variables: { id: category._id } })
          .then(() => {
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Category deleted successfully',
            });
          })
          .catch((e: any) => {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          });
      })
      .catch((e: unknown) => {
        if (e instanceof Error) {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        }
      });
  };

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={handleEdit}>
                <IconEdit className="w-4 h-4" />
                Edit
              </Command.Item>
              <Command.Item value="delete" onSelect={handleDelete}>
                <IconTrash className="w-4 h-4" />
                Delete
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <CategoryEditSheet
        category={category}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
      />
    </>
  );
};

export const categoryMoreColumn: ColumnDef<
  ICategory & { hasChildren: boolean }
> = {
  id: 'more',
  cell: CategoryMoreColumn,
  size: 33,
};
