import { IBroadcastMethodEnum } from '@/broadcast/types';
import { IconEye, IconPencil } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useMultiQueryState,
} from 'erxes-ui';
import { Can } from 'ui-modules';

type TBroadcastRowQueryParams = {
  messageId: string;
  editMessageId: string;
  method: IBroadcastMethodEnum;
};

export const BroadcastMoreColumnCell = ({
  cell,
}: {
  cell: Cell<any, unknown>;
}) => {
  const [, setQueryParams] = useMultiQueryState<TBroadcastRowQueryParams>([
    'messageId',
    'editMessageId',
    'method',
  ]);
  const { _id, isLive, method } = cell.row.original || {};

  // A live campaign is already reaching people: what it says, who it reaches
  // and the flow it runs are all settled.
  const canEdit = !isLive;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="preview"
              onSelect={() =>
                setQueryParams({ messageId: _id, editMessageId: null })
              }
            >
              <IconEye /> Preview
            </Command.Item>
            {canEdit && (
              <Can action="broadcastUpdate">
                <Command.Item
                  value="edit"
                  onSelect={() =>
                    setQueryParams({
                      messageId: null,
                      editMessageId: _id,
                      method,
                    })
                  }
                >
                  <IconPencil /> Edit
                </Command.Item>
              </Can>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const broadcastMoreColumn = {
  id: 'more',
  cell: BroadcastMoreColumnCell,
  size: 33,
};
