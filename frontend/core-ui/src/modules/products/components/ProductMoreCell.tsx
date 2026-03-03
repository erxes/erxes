import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useQueryState,
} from 'erxes-ui';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { IProduct } from 'ui-modules';
import { renderingProductDetailAtom } from '../states/productDetailStates';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';
import { ProductsDelete } from './product-command-bar/delete/productDelete';

export const ProductMoreColumn = (props: CellContext<IProduct, unknown>) => {
  const product = props.row.original;
  const [, setProductId] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const setRenderingProductDetail = useSetAtom(renderingProductDetailAtom);

  const handleEdit = () => {
    setProductId(product._id);
    setRenderingProductDetail(false);
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
            <ProductsDelete productIds={[product._id]}>
              {({ onClick, disabled }) => (
                <Command.Item
                  value="delete"
                  onSelect={onClick}
                  disabled={disabled}
                >
                  <IconTrash className="w-4 h-4" />
                  Delete
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
