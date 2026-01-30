import { CellContext } from '@tanstack/react-table';
import { RecordTable, DropdownMenu, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { UomForm } from './UomForm';
import { useUomsRemove } from '../../hooks/useUomsRemove';
import { IUom } from 'ui-modules';
import { IconEdit, IconTrash } from '@tabler/icons-react';

export const UomMoreColumnCell = (props: CellContext<IUom, unknown>) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { removeUoms } = useUomsRemove();
  const { _id } = props.row.original;

  return (
    <>
      <Sheet open={editOpen} onOpenChange={setEditOpen} modal>
        <Sheet.View
          className="p-0 sm:max-w-lg"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <UomForm uom={props.row.original} onOpenChange={setEditOpen} />
        </Sheet.View>
      </Sheet>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start">
          <DropdownMenu.Item
            onClick={() => {
              setEditOpen(true);
              setOpen(false);
            }}
          >
            <IconEdit className="mr-2 w-4 h-4" />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => {
              removeUoms({
                variables: { uomIds: [_id] },
                onCompleted: () => {
                  setOpen(false);
                },
              });
            }}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 w-4 h-4" />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
};

export const uomMoreColumn = {
  id: 'more',
  cell: UomMoreColumnCell,
  size: 33,
} as const;
