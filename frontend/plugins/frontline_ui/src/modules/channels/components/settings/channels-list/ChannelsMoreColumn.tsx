import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { IChannel } from '@/channels/types';
import { useNavigate } from 'react-router-dom';
import { useChannelRemove } from '@/channels/hooks/useChannelRemove';
import { useConfirm } from 'erxes-ui';
import { Spinner } from 'erxes-ui';

export const ChannelsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IChannel, unknown>;
}) => {
  const { _id } = cell.row.original;
  const navigate = useNavigate();
  const { removeChannel, loading } = useChannelRemove();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    navigate(`/settings/frontline/channels/${_id}`);
  };

  const handleDelete = () => {
    const confirmationValue = 'delete';
    const confirmationMessage = 'Are you sure you want to delete this channel?';

    confirm({
      message: confirmationMessage,
      options: { confirmationValue },
    }).then(() => {
      removeChannel({ variables: { id: _id } });
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
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              {loading ? <Spinner size="sm" /> : <IconTrash />} Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const channelsMoreColumn = {
  id: 'more',
  cell: ChannelsMoreColumnCell,
  size: 15,
};
