import { RecordTable, Combobox, Popover, Command } from 'erxes-ui';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Can, IProduct, useSidePanel } from 'ui-modules';
import { PRODUCT_CONTENT_TYPE } from '@/products/constants/productQueryKey';
import { ProductsDelete } from './product-command-bar/delete/productDelete';
import { useTranslation } from 'react-i18next';

export const ProductMoreColumn = (props: CellContext<IProduct, unknown>) => {
  const { t } = useTranslation('product');
  const product = props.row.original;
  const { openRecord } = useSidePanel();

  const handleEdit = () =>
    openRecord({ contentType: PRODUCT_CONTENT_TYPE, contentId: product._id });

  return (
    <Popover>
      <Can actions={['productsUpdate', 'productsDelete']}>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Can action="productsUpdate">
              <Command.Item value="edit" onSelect={handleEdit}>
                <IconEdit className="w-4 h-4" />
                {t('edit')}
              </Command.Item>
            </Can>
            <ProductsDelete productIds={[product._id]}>
              {({ onClick, disabled, trailing }) => (
                <Command.Item
                  value="delete"
                  onSelect={onClick}
                  disabled={disabled}
                >
                  <IconTrash className="w-4 h-4" />
                  {t('delete')}
                  {trailing}
                </Command.Item>
              )}
            </ProductsDelete>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const productMoreColumn: ColumnDef<IProduct> = {
  id: 'more',
  cell: ProductMoreColumn,
  size: 33,
};
