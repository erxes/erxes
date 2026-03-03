import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/table-core';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  Sheet,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { IUom } from 'ui-modules';
import { useUomsRemove } from '../../hooks/useUomsRemove';
import { UomForm } from './UomForm';

export const UomMoreColumn = (props: CellContext<IUom, unknown>) => {
  const uom = props.row.original;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { removeUoms, loading } = useUomsRemove();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${uom.name}"?`,
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

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen} modal>
        <Sheet.View className="p-0 sm:max-w-lg">
          <UomForm uom={uom} onOpenChange={setIsEditOpen} />
        </Sheet.View>
      </Sheet>
    </>
  );
};

export const uomMoreColumn: ColumnDef<IUom> = {
  id: 'more',
  cell: UomMoreColumn,
  size: 33,
};
