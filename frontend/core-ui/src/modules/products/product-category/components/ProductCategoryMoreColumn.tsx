import { CellContext } from '@tanstack/react-table';
import { IProductCategory } from '@/products/types/productTypes';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable, Popover, Command, Combobox } from 'erxes-ui';
import { renderingCategoryDetailAtom } from '../states/ProductCategory';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useRemoveCategories } from '../hooks/useRemoveCategories';
import { CategoriesDelete } from './product-command-bar/delete/CategoryDelete';

export const CategoryMoreColumnCell = (
  props: CellContext<IProductCategory & { hasChildren: boolean }, unknown>,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCategoryDetail = useSetAtom(renderingCategoryDetailAtom);
  const { _id } = props.row.original;
  const { loading } = useRemoveCategories();

  const setOpen = (categoryId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('category_id', categoryId);
    setSearchParams(newSearchParams);
  };

  const handleEdit = () => {
    setOpen(_id);
    setRenderingCategoryDetail(false);
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
            <CategoriesDelete categoryIds={_id}>
              {({ onClick, disabled }) => (
                <Command.Item
                  value="delete"
                  onSelect={onClick}
                  disabled={disabled || loading}
                >
                  <IconTrash className="w-4 h-4" />
                  Delete
                </Command.Item>
              )}
            </CategoriesDelete>
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
