import { CellContext } from '@tanstack/react-table';
import { IProductCategory } from '@/products/types/productTypes';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import {
  RecordTable,
  Popover,
  useConfirm,
  useToast,
  Command,
  Combobox,
} from 'erxes-ui';
import { renderingCategoryDetailAtom } from '../states/ProductCategory';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useRemoveCategories } from '../hooks/useRemoveCategories';

export const CategoryMoreColumnCell = (
  props: CellContext<IProductCategory & { hasChildren: boolean }, unknown>,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCategoryDetail = useSetAtom(renderingCategoryDetailAtom);
  const { _id, name } = props.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeCategory, loading } = useRemoveCategories();

  const setOpen = (categoryId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('category_id', categoryId);
    setSearchParams(newSearchParams);
  };

  const handleEdit = () => {
    setOpen(_id);
    setRenderingCategoryDetail(false);
  };

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${name}"?`,
    })
      .then(() => {
        removeCategory(_id, {
          onError: (e: any) => {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          },
          onCompleted: () => {
            toast({
              title: 'Success',
              description: 'Category deleted successfully.',
              variant: 'success',
            });
          },
        });
      })
      .catch(() => {
        toast({
          title: 'Cancelled',
          description: 'Category deletion cancelled.',
        });
      });
  };

  return (
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
            <Command.Item
              value="delete"
              onSelect={handleDelete}
              disabled={loading}
            >
              <IconTrash className="w-4 h-4" />
              Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const categoryMoreColumn = {
  id: 'more',
  cell: CategoryMoreColumnCell,
  size: 33,
} as const;
