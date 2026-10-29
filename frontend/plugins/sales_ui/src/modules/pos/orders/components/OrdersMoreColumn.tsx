import { Cell } from '@tanstack/react-table';
import { RecordTable, Command, Combobox, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { IOrder } from '@/pos/types/order';
import { POS_ORDER_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { IconEdit } from '@tabler/icons-react';

export const OrdersMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IOrder, unknown>;
}) => {
  const { t } = useTranslation('sales');
  const { openRecord } = useSidePanel();
  const { _id } = cell.row.original;

  const setOpen = (orderId: string) => {
    if (!orderId) {
      return;
    }
    openRecord({ contentType: POS_ORDER_CONTENT_TYPE, contentId: orderId });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => setOpen(_id)}
              disabled={!_id}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const ordersMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: OrdersMoreColumnCell,
  size: 33,
};
