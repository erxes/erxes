import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Sheet, useQueryState } from 'erxes-ui';
import {
  IPosOrderDetail,
  IOrderCustomer,
  IOrderItem,
  IPaidAmount,
  IPutResponse,
} from '../types/msDynamicCheckOrder';

const ORDER_DETAIL_ID_KEY = 'orderDetailId';

type Props = {
  orders: IPosOrderDetail;
};

const PosOrderDetail = ({ orders }: Props) => {
  const [orderDetailId, setOrderDetailId] =
    useQueryState<string>(ORDER_DETAIL_ID_KEY);

  const open = Boolean(orderDetailId) && orderDetailId === orders?._id;

  const handleOpenChange = (next: boolean) => {
    if (!next) setOrderDetailId(null);
  };

  const formatAmount = (value?: number) => (value || 0).toLocaleString();

  const renderRow = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between py-2 border-b text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span>{value || '-'}</span>
    </div>
  );

  const generateCustomerLabel = (customer?: IOrderCustomer) => {
    if (!customer) return '';

    const { firstName, lastName, primaryPhone, primaryEmail } = customer;

    let value = firstName ? firstName.toUpperCase() : '';

    if (lastName) value += ` ${lastName}`;
    if (primaryPhone) value += ` (${primaryPhone})`;
    if (primaryEmail) value += ` /${primaryEmail}/`;

    return value;
  };

  const content = (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Order Info
        </h3>
        {renderRow(
          (orders.customerType || 'Customer').toUpperCase(),
          orders.customer ? generateCustomerLabel(orders.customer) : '',
        )}
        {renderRow('Bill Number', orders.number)}
        {renderRow(
          'Date',
          dayjs(orders.paidDate || orders.createdAt).format('YYYY-MM-DD HH:mm'),
        )}
        {orders.deliveryInfo &&
          renderRow('Delivery Info', orders.deliveryInfo.description)}
        {orders.syncErkhetInfo &&
          renderRow('Erkhet Info', orders.syncErkhetInfo)}
        {orders.convertDealId &&
          renderRow(
            'Deal',
            <Link to={orders.dealLink || ''} className="text-primary underline">
              {orders.deal?.name || 'Deal'}
            </Link>,
          )}
      </div>

      {(orders.putResponses || []).length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ebarimt Responses
          </h3>
          {orders.putResponses?.map((p: IPutResponse) => (
            <div key={p.billId} className="space-y-1">
              {renderRow('Bill ID', p.billId)}
              {renderRow('Ebarimt Date', dayjs(p.date).format('LLL'))}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-hidden">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 pt-4 pb-2">
          Items
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y bg-muted/30">
              <th className="px-3 py-2 text-left font-medium">Product</th>
              <th className="px-3 py-2 text-left font-medium">Count</th>
              <th className="px-3 py-2 text-left font-medium">Unit Price</th>
              <th className="px-3 py-2 text-left font-medium">Amount</th>
              <th className="px-3 py-2 text-left font-medium">Discount</th>
            </tr>
          </thead>
          <tbody>
            {(orders.items || []).map((item: IOrderItem, idx: number) => (
              <tr
                key={item._id}
                className={
                  idx !== (orders.items || []).length - 1 ? 'border-b' : ''
                }
              >
                <td className="px-3 py-2">{item.productName}</td>
                <td className="px-3 py-2">{item.count}</td>
                <td className="px-3 py-2">{formatAmount(item.unitPrice)}</td>
                <td className="px-3 py-2">
                  {formatAmount((item.count || 0) * (item.unitPrice || 0))}
                </td>
                <td className="px-3 py-2">
                  {formatAmount(item.discountAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Totals
        </h3>
        {renderRow('Total Amount', formatAmount(orders.totalAmount))}
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Payment Breakdown
        </h3>
        {orders.cashAmount !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Cash Amount</span>
            <span className="font-medium tabular-nums">
              {formatAmount(orders.cashAmount)}
            </span>
          </div>
        )}
        {orders.mobileAmount !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Mobile Amount</span>
            <span className="font-medium tabular-nums">
              {formatAmount(orders.mobileAmount)}
            </span>
          </div>
        )}
        {(orders.paidAmounts || []).map((paid: IPaidAmount) => (
          <div key={paid._id} className="flex justify-between items-center">
            <span className="text-sm">{paid.type}</span>
            <span className="font-medium tabular-nums">
              {formatAmount(paid.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.View className="sm:max-w-3xl">
        <Sheet.Header>
          <Sheet.Title>Order Detail</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto p-5">{content}</Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export { PosOrderDetail };
