import { Cell } from '@tanstack/react-table';
import { useNavigate, useParams } from 'react-router-dom';
import { IPosOrdersByCustomer } from '@/pos/pos-orders-by-customer/types/posOrdersByCustomerType';
import { Popover, Command, Combobox, RecordTable } from 'erxes-ui';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const PosOrdersByCustomerMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPosOrdersByCustomer, unknown>;
}) => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const { posId } = useParams();
  const { _id } = cell.row.original;

  const handleSeeOrders = (customerId: string) => {
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('customer', customerId);

    if (!posId) {
      navigate(`../orders?${newSearchParams.toString()}`);
      return;
    }

    navigate(`/sales/pos/${posId}/orders?${newSearchParams.toString()}`);
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
              value="see-orders"
              onSelect={() => handleSeeOrders(_id)}
              disabled={!_id}
            >
              <IconEye /> {t('see-orders')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const PosOrdersByCustomerMoreColumn = {
  id: 'more',
  cell: PosOrdersByCustomerMoreColumnCell,
  size: 20,
};
