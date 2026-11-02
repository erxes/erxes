import { useChannelRemove } from '@/channels/hooks/useChannelRemove';
import { IChannel } from '@/channels/types';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { CHANNEL_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useCanManageChannels } from '@/channels/hooks/useCanManageChannels';
import { useTranslation } from 'react-i18next';

const ChannelActionCommands = ({
  handleEdit,
  handleDelete,
  loading,
}: {
  handleEdit: () => void;
  handleDelete: () => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item value="edit" onSelect={handleEdit}>
          <IconEdit /> {t('edit', 'Edit')}
        </Command.Item>
        <Command.Item value="delete" disabled={loading} onSelect={handleDelete}>
          {loading ? <Spinner size="sm" /> : <IconTrash />}{' '}
          {t('delete', 'Delete')}
        </Command.Item>
      </Command.List>
    </Command>
  );
};

export const ChannelsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IChannel, unknown>;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { _id } = cell.row.original;
  const { openRecord } = useSidePanel();
  const canManage = useCanManageChannels([_id]);
  const { removeChannel, loading } = useChannelRemove();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    openRecord({ contentType: CHANNEL_CONTENT_TYPE, contentId: _id });
  };

  const handleDelete = () => {
    const confirmationValue = 'delete';
    const confirmationMessage = t(
      'confirm-delete-channel',
      'Are you sure you want to delete this channel?',
    );

    confirm({
      message: confirmationMessage,
      options: { confirmationValue },
    })
      .then(() => {
        removeChannel({ variables: { id: _id } });
      })
      .catch(() => undefined);
  };

  if (!canManage(_id)) return null;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <ChannelActionCommands
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          loading={loading}
        />
      </Combobox.Content>
    </Popover>
  );
};

export const channelsMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: ChannelsMoreColumnCell,
  size: 33,
};
