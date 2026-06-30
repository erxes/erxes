import { Cell } from '@tanstack/react-table';
import { IconEye, IconSend } from '@tabler/icons-react';
import {
  Command,
  Combobox,
  Popover,
  RecordTable,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IMSDynamicCheckOrder } from '../types/msDynamicCheckOrder';
import { OrdersDetailContainer } from '../../containers/PosOrderDetail';

const ORDER_DETAIL_ID_KEY = 'orderDetailId';

/** More menu dotor action list gargana. */
const CheckSyncedOrdersMoreActions = ({
  orderId,
  onView,
  onResend,
}: {
  orderId: string;
  onView: (orderId: string) => void;
  onResend: (orderId: string) => void;
}) => {
  const { t } = useTranslation('mongolian');
  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item value="view" onSelect={() => onView(orderId)}>
          <IconEye /> {t('view-detail')}
        </Command.Item>
        <Command.Item value="resend" onSelect={() => onResend(orderId)}>
          <IconSend /> {t('resend')}
        </Command.Item>
      </Command.List>
    </Command>
  );
};

/** More popover-iin content gargana. */
const CheckSyncedOrdersMoreContent = ({
  orderId,
  onView,
  onResend,
}: {
  orderId: string;
  onView: (orderId: string) => void;
  onResend: (orderId: string) => void;
}) => (
  <Popover>
    <Popover.Trigger asChild>
      <RecordTable.MoreButton className="w-full h-full" />
    </Popover.Trigger>
    <Combobox.Content>
      <CheckSyncedOrdersMoreActions
        orderId={orderId}
        onView={onView}
        onResend={onResend}
      />
    </Combobox.Content>
  </Popover>
);

/** More column deer view detail ba resend action gargana. */
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
      <CheckSyncedOrdersMoreContent
        orderId={order._id}
        onView={setOrderDetailId}
        onResend={onResend}
      />
      <OrdersDetailContainer order={order} />
    </>
  );
};

/** Check orders table-iin more column config gargana. */
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
