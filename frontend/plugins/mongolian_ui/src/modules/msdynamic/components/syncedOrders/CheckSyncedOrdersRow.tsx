import { useState } from 'react';
import dayjs from 'dayjs';

import { Button } from 'erxes-ui/components/button';
import { Dialog } from 'erxes-ui/components/dialog';

import Detail from '../../containers/PosOrderDetail';

type Props = {
  order: any;
  isChecked: boolean;
  isUnsynced: boolean;
  toggleBulk: (order: any, isChecked?: boolean) => void;
  toSend: (orderIds: string[]) => void;
  syncedInfo: any;
};

const Row = ({
  order,
  isChecked,
  isUnsynced,
  toggleBulk,
  toSend,
  syncedInfo,
}: Props) => {
  const [open, setOpen] = useState(false);

  const { number, createdAt, totalAmount, paidDate } = order;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    toggleBulk(order, e.target.checked);
  };

  const handleSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toSend([order._id]);
  };

  const handleRowClick = () => {
    setOpen(true);
  };

  return (
    <>
      <tr
        onClick={handleRowClick}
        className="cursor-pointer hover:bg-muted/40 transition"
      >
        <td onClick={(e) => e.stopPropagation()} className="p-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
        </td>

        <td className="p-2">{number}</td>

        <td className="p-2">{totalAmount?.toLocaleString()}</td>

        <td className="p-2">
          {createdAt ? dayjs(createdAt).format('LLL') : ''}
        </td>

        <td className="p-2">{paidDate ? dayjs(paidDate).format('LLL') : ''}</td>

        <td className="p-2">
          {syncedInfo?.syncedDate
            ? dayjs(syncedInfo.syncedDate).format('LL')
            : ''}
        </td>

        <td className="p-2">{syncedInfo?.syncedBillNumber || ''}</td>

        <td className="p-2">{syncedInfo?.syncedCustomer || ''}</td>

        <td className="p-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={handleSend}>
            Resend
          </Button>
        </td>
      </tr>

      {/* Modern Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-3xl">
          <Dialog.Header>
            <Dialog.Title>Order detail</Dialog.Title>
          </Dialog.Header>

          <Detail order={order} />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default Row;
