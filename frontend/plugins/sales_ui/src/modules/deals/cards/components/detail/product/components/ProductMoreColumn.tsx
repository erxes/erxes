import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';

import { IProductData } from 'ui-modules';
import { IconTrash } from '@tabler/icons-react';
import { atom } from 'jotai';
import { useRemoveProducts } from '../hooks/useRemoveProduct';
import { useTranslation } from 'react-i18next';

export const renderingProductDetailAtom = atom(false);

export const ProductMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductData, unknown>;
}) => {
  const { _id } = cell.row.original;
  const { confirm } = useConfirm();
  const { removeProducts, loading: removeLoading } = useRemoveProducts();
  const { toast } = useToast();
  const { t } = useTranslation('sales');

  const onRemove = () => {
    confirm({
      message: t('confirm-remove-selected'),
      options: confirmOptions,
    }).then(async () => {
      try {
        removeProducts({
          variables: {
            productIds: [_id],
          },
        });
      } catch (e) {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
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
              className="text-destructive"
              onSelect={onRemove}
            >
              <IconTrash /> {t('delete')}
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
  header: RecordTable.ColumnSelector,
};
