import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

type Props = {
  order: any;
};

const OrderDetail = ({ order }: Props) => {
  const formatAmount = (value: number) =>
    (value || 0).toLocaleString();

  const renderRow = (
    label: string,
    value: React.ReactNode,
  ) => (
    <div className="flex justify-between py-2 border-b text-sm">
      <span className="font-medium text-muted-foreground">
        {label}
      </span>
      <span>{value || '-'}</span>
    </div>
  );

  const generateCustomerLabel = (customer: any) => {
    if (!customer) return '';

    const {
      firstName,
      lastName,
      primaryPhone,
      primaryEmail,
    } = customer;

    let value = firstName
      ? firstName.toUpperCase()
      : '';

    if (lastName) value += ` ${lastName}`;
    if (primaryPhone)
      value += ` (${primaryPhone})`;
    if (primaryEmail)
      value += ` /${primaryEmail}/`;

    return value;
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-2">
        {renderRow(
          (order.customerType || 'Customer')
            .toUpperCase(),
          order.customer
            ? generateCustomerLabel(order.customer)
            : '',
        )}

        {renderRow('Bill Number', order.number)}

        {renderRow(
          'Date',
          dayjs(
            order.paidDate ||
              order.createdAt,
          ).format('LLL'),
        )}

        {order.deliveryInfo &&
          renderRow(
            'Delivery Info',
            order.deliveryInfo.description,
          )}

        {order.syncErkhetInfo &&
          renderRow(
            'Erkhet Info',
            order.syncErkhetInfo,
          )}

        {order.convertDealId &&
          renderRow(
            'Deal',
            <Link
              to={order.dealLink || ''}
              className="text-primary underline"
            >
              {order.deal?.name || 'Deal'}
            </Link>,
          )}
      </div>

      {/* Ebarimt Responses */}
      {(order.putResponses || []).map(
        (p: any) => (
          <div
            key={p.billId}
            className="space-y-1"
          >
            {renderRow('Bill ID', p.billId)}
            {renderRow(
              'Ebarimt Date',
              dayjs(p.date).format('LLL'),
            )}
          </div>
        ),
      )}

      {/* Items Table */}
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="p-2 text-left">
                Product
              </th>
              <th className="p-2 text-left">
                Count
              </th>
              <th className="p-2 text-left">
                Unit Price
              </th>
              <th className="p-2 text-left">
                Amount
              </th>
              <th className="p-2 text-left">
                Discount
              </th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map(
              (item: any) => (
                <tr
                  key={item._id}
                  className="border-b"
                >
                  <td className="p-2">
                    {item.productName}
                  </td>
                  <td className="p-2">
                    {item.count}
                  </td>
                  <td className="p-2">
                    {formatAmount(
                      item.unitPrice,
                    )}
                  </td>
                  <td className="p-2">
                    {formatAmount(
                      item.count *
                        item.unitPrice,
                    )}
                  </td>
                  <td className="p-2">
                    {formatAmount(
                      item.discountAmount,
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="space-y-2">
        {renderRow(
          'Total Amount',
          formatAmount(order.totalAmount),
        )}
      </div>

      {/* Editable Amounts */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">
          Payment Breakdown
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Cash Amount</span>
            <input
              type="number"
              value={order.cashAmount || 0}
              className="border rounded px-2 py-1 text-sm w-32"
              readOnly
            />
          </div>

          <div className="flex justify-between items-center">
            <span>Mobile Amount</span>
            <input
              type="number"
              value={order.mobileAmount || 0}
              className="border rounded px-2 py-1 text-sm w-32"
              readOnly
            />
          </div>

          {(order.paidAmounts || []).map(
            (paid: any) => (
              <div
                key={paid._id}
                className="flex justify-between items-center"
              >
                <span>{paid.type}</span>
                <input
                  type="number"
                  value={paid.amount || 0}
                  className="border rounded px-2 py-1 text-sm w-32"
                  readOnly
                />
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;