import { CellContext } from '@tanstack/react-table';
import { IProductCategory } from '@/products/types/productTypes';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable, Popover, Command, Combobox } from 'erxes-ui';
import { renderingCategoryDetailAtom } from '@/products/product-category/states/ProductCategory';
import { IconEdit, IconListDetails, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { CategoryConditionsPanel } from './CategoryConditionsPanel';
import { CategoriesDelete } from '@/products/product-category/components/product-command-bar/delete/CategoryDelete';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const CategoryMoreColumnCell = (
  props: CellContext<IProductCategory & { hasChildren: boolean }, unknown>,
) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCategoryDetail = useSetAtom(renderingCategoryDetailAtom);
  const { _id, name } = props.row.original;
  const [conditionOpen, setConditionOpen] = useState(false);
  // Edit and Conditions open beside the list, so the menu closes for them;
  // Delete keeps it while its confirmation is open.
  const [menuOpen, setMenuOpen] = useState(false);

  const setOpen = (categoryId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('category_id', categoryId);
    setSearchParams(newSearchParams);
  };

  const handleEdit = () => {
    setMenuOpen(false);
    setOpen(_id);
    setRenderingCategoryDetail(false);
  };

  const handleConditions = () => {
    setMenuOpen(false);
    setConditionOpen(true);
  };

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Can action="productCategoriesManage">
          <Popover.Trigger asChild>
            <RecordTable.MoreButton className="w-full h-full" />
          </Popover.Trigger>
        </Can>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={handleEdit}>
                <IconEdit className="w-4 h-4" />
                {t('edit')}
              </Command.Item>
              <Command.Item value="conditions" onSelect={handleConditions}>
                <IconListDetails className="w-4 h-4" />
                {t('conditions')}
              </Command.Item>
              <CategoriesDelete categories={[props.row.original]}>
                {({ onClick, disabled }) => (
                  <Command.Item
                    value="delete"
                    onSelect={onClick}
                    disabled={disabled}
                  >
                    <IconTrash className="w-4 h-4" />
                    {t('delete')}
                  </Command.Item>
                )}
              </CategoriesDelete>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <CategoryConditionsPanel
        categoryId={_id}
        categoryName={name}
        open={conditionOpen}
        onOpenChange={setConditionOpen}
      />
    </>
  );
};

export const categoryMoreColumn = {
  id: 'more',
  cell: CategoryMoreColumnCell,
  size: 33,
} as const;
