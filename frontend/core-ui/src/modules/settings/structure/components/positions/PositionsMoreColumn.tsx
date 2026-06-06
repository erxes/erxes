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
import { IPositionListItem } from '../../types/position';
import { renderingPositionDetailAtom } from '../../states/renderingPositionDetail';
import { useRemovePosition } from '../../hooks/usePositionActions';

export const PositionsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPositionListItem, unknown>;
}) => {
  const { _id, title } = cell.row.original || {};
  const [, setOpenPosition] = useQueryState('position_id');
  const setRenderingPositionDetail = useSetAtom(renderingPositionDetailAtom);
  const { confirm } = useConfirm();
  const { handleRemove } = useRemovePosition();

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${title}" position?`,
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
      <Can action="positionsManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Can action="positionsManage">
              <Command.Item
                value="edit"
                onSelect={() => {
                  setOpenPosition(_id);
                  setRenderingPositionDetail(false);
                }}
              >
                <IconEdit /> Edit
              </Command.Item>
            </Can>
            <Can action="positionsManage">
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

export const PositionsMoreColumn = {
  id: 'more',
  cell: PositionsMoreColumnCell,
  size: 25,
};
