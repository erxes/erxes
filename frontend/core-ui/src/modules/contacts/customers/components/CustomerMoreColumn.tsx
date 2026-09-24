import { useBroadcastContacts } from '@/broadcast/hooks/useBroadcastContacts';
import { IconEdit, IconSend } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Cell } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { Can, ICustomer } from 'ui-modules';

export const CustomerMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICustomer, unknown>;
}) => {
  const { t } = useTranslation('broadcasts');
  const { setContacts } = useBroadcastContacts();
  const [searchParams, setSearchParams] = useSearchParams();
  const { _id } = cell.row.original;

  const setOpen = (customerId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('contactId', customerId);
    setSearchParams(newSearchParams);
  };

  const sendBroadcast = (customerId: string) => {
    setContacts([customerId]);

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('method', 'email');
    setSearchParams(newSearchParams);
  };

  return (
    <Popover>
      <Can action="contactsUpdate">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => setOpen(_id)}>
              <IconEdit /> Edit
            </Command.Item>
            <Can action="broadcastCreate">
              <Command.Item
                value="send-broadcast"
                onSelect={() => sendBroadcast(_id)}
              >
                <IconSend /> {t('actions.send-broadcast')}
              </Command.Item>
            </Can>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const customerMoreColumn = {
  id: 'more',
  header: RecordTable.ColumnSelector,
  cell: CustomerMoreColumnCell,
  size: 33,
};
