import { useChannelMemberRemove } from '@/channels/hooks/useChannelMemberRemove';
import { Cell } from '@tanstack/react-table';
import {
  RecordTable,
  Popover,
  Command,
  Combobox,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const MemberMoreColumnCell = ({ cell }: { cell: Cell<any, any> }) => {
  const { t } = useTranslation('frontline');
  const { memberId, channelId } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeChannelMember } = useChannelMemberRemove();

  const handleDelete = async () => {
    if (!memberId || !channelId) {
      toast({
        title: t('error', 'Error'),
        description: t('member-id-missing', 'Member ID is missing'),
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: t(
        'confirm-delete-member',
        'Are you sure you want to delete this member?',
      ),
    }).then(() => {
      removeChannelMember({
        variables: { channelId, memberId },
      });
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
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete', 'Delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
export const MemberMoreColumn = {
  id: 'more',
  cell: MemberMoreColumnCell,
  size: 33,
};
