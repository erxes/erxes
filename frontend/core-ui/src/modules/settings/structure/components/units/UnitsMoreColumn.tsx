import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Can } from 'ui-modules';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  toast,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { IUnitListItem } from '../../types/unit';
import { renderingUnitDetailAtom } from '../../states/renderingUnitDetail';
import { useRemoveUnit } from '../../hooks/useUnitActions';

export const UnitsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IUnitListItem, unknown>;
}) => {
  const { _id, title } = cell.row.original;
  const [, setOpenUnit] = useQueryState('unit_id');
  const setRenderingUnitDetail = useSetAtom(renderingUnitDetailAtom);
  const { confirm } = useConfirm();
  const { handleRemove } = useRemoveUnit();

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to remove "${title}"?`,
    }).then(async () => {
      try {
        await handleRemove({ variables: { ids: [_id] } });
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Popover>
      <Can action="unitsManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Can action="unitsManage">
              <Command.Item
                value="edit"
                onSelect={() => {
                  setOpenUnit(_id);
                  setRenderingUnitDetail(false);
                }}
              >
                <IconEdit /> Edit
              </Command.Item>
            </Can>
            <Can action="unitsManage">
              <Command.Item
                value="delete"
                onSelect={handleDelete}
                className="text-destructive"
              >
                <IconTrash /> Delete
              </Command.Item>
            </Can>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const UnitsMoreColumn = {
  id: 'more',
  cell: UnitsMoreColumnCell,
  size: 25,
};
