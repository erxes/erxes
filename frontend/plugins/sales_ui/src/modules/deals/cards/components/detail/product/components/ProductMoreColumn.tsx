import { Cell, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable, useConfirm } from 'erxes-ui';

import { IProductData } from 'ui-modules';
import { IconTrash } from '@tabler/icons-react';
import { atom } from 'jotai';
import { useRemoveProducts } from '../hooks/useRemoveProduct';

export const renderingProductDetailAtom = atom(false);
const confirmOptions = { confirmationValue: 'delete' };

export const ProductMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductData, unknown>;
}) => {
  const { _id } = cell.row.original;
  const { confirm } = useConfirm();
  const { removeProducts, loading: removeLoading } = useRemoveProducts();

  const onRemove = () => {
    confirm({
      message: 'Are you sure you want to remove the selected?',
      options: confirmOptions,
    }).then(async () => {
      try {
        removeProducts({
          variables: {
            productIds: [_id],
          },
        });
      } catch (e) {
        console.error(e.message);
      }
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
            <Command.Item
              disabled={removeLoading}
              value="remove"
              onSelect={onRemove}
            >
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const productMoreColumn: ColumnDef<IProductData> = {
  id: 'more',
  size: 33,
  cell: ProductMoreColumnCell,
};
