import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useConfirm,
  useToast,
  useQueryState,
} from 'erxes-ui';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { IProduct } from 'ui-modules';
import { useRemoveProducts } from '@/products/product-detail/hooks/useRemoveProduct';
import { renderingProductDetailAtom } from '../states/productDetailStates';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';

export const ProductMoreColumn = (props: CellContext<IProduct, unknown>) => {
  const product = props.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeProducts, loading } = useRemoveProducts();
  const [, setProductId] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const setRenderingProductDetail = useSetAtom(renderingProductDetailAtom);

  const handleEdit = () => {
    setProductId(product._id);
    setRenderingProductDetail(false);
  };

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${product.name}"?`,
    }).then(() => {
      removeProducts([product._id], {
        onCompleted: () => {
          toast({
            title: 'Product deleted successfully',
            variant: 'success',
          });
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
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

export const productMoreColumn: ColumnDef<IProduct> = {
  id: 'more',
  cell: ProductMoreColumn,
  size: 33,
};
