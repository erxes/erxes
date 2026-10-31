import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/table-core';
import { Combobox, Command, Popover, RecordTable, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { Can, IUom } from 'ui-modules';
import { useUomsRemove } from '@/products/settings/hooks/useUomsRemove';
import { UomForm } from '@/products/settings/components/uoms/UomForm';

export const UomMoreColumn = (props: CellContext<IUom, unknown>) => {
  const uom = props.row.original;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { t } = useTranslation('product', { keyPrefix: 'uoms' });
  const { removeUoms, loading } = useUomsRemove();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete', { name: uom.name }),
      options: confirmOptions,
    }).then(() => {
      removeUoms({
        variables: { uomIds: [uom._id] },
      });
    });
  };

  return (
    <>
      <Popover>
        <Can action="uomsManage">
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
              <Command.Item
                value="delete"
                onSelect={handleDelete}
                disabled={loading}
              >
                <IconTrash className="w-4 h-4" />
                {t('delete')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>

      <CoreModulePanel
        name={`products/settings/uoms/UomMoreColumn/${uom._id}`}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        modal
      >
        <CoreModulePanel.View className="p-0 sm:max-w-lg">
          <UomForm uom={uom} onOpenChange={setIsEditOpen} />
        </CoreModulePanel.View>
      </CoreModulePanel>
    </>
  );
};

export const uomMoreColumn: ColumnDef<IUom> = {
  id: 'more',
  cell: UomMoreColumn,
  size: 33,
};
