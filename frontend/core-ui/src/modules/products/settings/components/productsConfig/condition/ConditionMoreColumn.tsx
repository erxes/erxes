import { ProductEditorPanel } from '@/products/components/ProductEditorPanel';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { useProductConditionsRemove } from '@/products/settings/hooks/useProductConditionsRemove';
import { ConditionForm } from './ConditionForm';
import { IProductCondition } from './types';

const ConditionMoreColumn = ({
  row,
}: CellContext<IProductCondition, unknown>) => {
  const { t } = useTranslation('product');
  const [editOpen, setEditOpen] = useState(false);
  const { remove, loading } = useProductConditionsRemove();

  return (
    <>
      <Popover>
        <Can action="productsConfigsManage">
          <Popover.Trigger asChild>
            <RecordTable.MoreButton className="w-full h-full" />
          </Popover.Trigger>
        </Can>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={() => setEditOpen(true)}>
                <IconEdit className="w-4 h-4" />
                {t('edit', 'Edit')}
              </Command.Item>
              <Command.Item
                value="delete"
                disabled={loading}
                onSelect={() => remove([row.original._id])}
              >
                <IconTrash className="w-4 h-4" />
                {t('delete', 'Delete')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <ProductEditorPanel
        name={`conditions/${row.original._id}/actions`}
        open={editOpen}
        onOpenChange={setEditOpen}
        requiredPermission="productsConfigsManage"
      >
        {editOpen && (
          <ConditionForm
            condition={row.original}
            onDone={() => setEditOpen(false)}
          />
        )}
      </ProductEditorPanel>
    </>
  );
};

export const conditionMoreColumn: ColumnDef<IProductCondition> = {
  id: 'more',
  cell: ConditionMoreColumn,
  size: 33,
};
