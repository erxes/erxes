import { Cell } from '@tanstack/react-table';
import { IconEye, IconSend } from '@tabler/icons-react';
import {
  Command,
  Combobox,
  Popover,
  RecordTable,
  useQueryState,
} from 'erxes-ui';
import { IMSDynamicCheckOrder } from '../types/msDynamicCheckOrder';
import { OrdersDetailContainer } from '../../containers/PosOrderDetail';

const ORDER_DETAIL_ID_KEY = 'orderDetailId';

export const CheckSyncedOrdersMoreColumnCell = ({
  cell,
  onResend,
}: {
  cell: Cell<IMSDynamicCheckOrder, unknown>;
  onResend: (orderId: string) => void;
}) => {
  const [, setOrderDetailId] = useQueryState<string>(ORDER_DETAIL_ID_KEY);
  const order = cell.row.original;

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item
                value="view"
                onSelect={() => setOrderDetailId(order._id)}
              >
                <IconEye /> View detail
              </Command.Item>
              <Command.Item value="resend" onSelect={() => onResend(order._id)}>
                <IconSend /> Resend
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <OrdersDetailContainer order={order} />
    </>
  );
};

export const getCheckSyncedOrdersMoreColumn = ({
  onResend,
}: {
  onResend: (orderId: string) => void;
}) => ({
  id: 'more' as const,
  cell: (info: { cell: Cell<IMSDynamicCheckOrder, unknown> }) => (
    <CheckSyncedOrdersMoreColumnCell cell={info.cell} onResend={onResend} />
  ),
  size: 33,
});
