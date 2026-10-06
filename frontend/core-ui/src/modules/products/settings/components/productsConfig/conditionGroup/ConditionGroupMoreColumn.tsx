import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { useProductConditionGroupsRemove } from '@/products/settings/hooks/useProductConditionGroupsRemove';
import { ConditionGroupForm } from './ConditionGroupForm';
import { IProductConditionGroup } from './types';

const ConditionGroupMoreColumn = ({
  row,
}: CellContext<IProductConditionGroup, unknown>) => {
  const { t } = useTranslation('product');
  const [editOpen, setEditOpen] = useState(false);
  const { remove, loading } = useProductConditionGroupsRemove();

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
      <Sheet open={editOpen} onOpenChange={setEditOpen} modal>
        <Sheet.View className="p-0 sm:max-w-lg">
          {editOpen && (
            <ConditionGroupForm
              group={row.original}
              onDone={() => setEditOpen(false)}
            />
          )}
        </Sheet.View>
      </Sheet>
    </>
  );
};

export const conditionGroupMoreColumn: ColumnDef<IProductConditionGroup> = {
  id: 'more',
  cell: ConditionGroupMoreColumn,
  size: 33,
};
