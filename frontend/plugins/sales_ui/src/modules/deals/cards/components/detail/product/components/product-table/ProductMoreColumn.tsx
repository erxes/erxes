import { Cell, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable, useConfirm } from 'erxes-ui';

import { IProductData } from 'ui-modules';
import { IconCopy, IconEdit, IconTrash } from '@tabler/icons-react';
import { productRowActionsAtom } from '../../productTableAtom';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ProductMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductData, unknown>;
}) => {
  const productData = cell.row.original;
  const confirmOptions = { confirmationValue: 'delete' };
  const { confirm } = useConfirm();
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);
  const actions = useAtomValue(productRowActionsAtom);

  const runAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  const onRemove = () => {
    confirm({
      message: t('confirm-remove-selected'),
      options: confirmOptions,
    }).then(() => actions?.onDelete(productData));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => runAction(() => actions?.onEdit(productData))}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item
              value="duplicate"
              onSelect={() =>
                runAction(() => actions?.onDuplicate(productData))
              }
            >
              <IconCopy /> {t('duplicate')}
            </Command.Item>
            <Command.Item
              value="remove"
              className="text-destructive"
              onSelect={() => runAction(onRemove)}
            >
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const productMoreColumn = (): ColumnDef<IProductData> => ({
  id: 'more',
  size: 33,
  cell: (cellProps) => <ProductMoreColumnCell {...cellProps} />,
  header: () => <RecordTable.ColumnSelector />,
});
