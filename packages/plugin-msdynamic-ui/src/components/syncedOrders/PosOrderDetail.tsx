import * as dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import {
  __,
  FieldStyle,
  SidebarCounter,
  SidebarList,
  Table,
} from '@erxes/ui/src';
import { DetailRow, FinanceAmount, FlexRow } from '../../styles';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';

type Props = {
  order: any;
};

const OrderDetail = (props: Props) => {
  const { order } = props;

  const displayValue = (order, name) => {
    const value = _.get(order, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  };

  const renderRow = (label, value) => {
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <SidebarCounter>{value || '-'}</SidebarCounter>
        </FlexRow>
      </li>
    );
  };

  const renderEditRow = (label, key) => {
    const value = order[key];

    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <FormControl type="number" value={value} />
        </FlexRow>
      </li>
    );
  };

  const renderEditPaid = () => {
    return order.paidAmounts.map((paidAmount) => {
      return (
        <li key={paidAmount._id}>
          <FlexRow key={paidAmount._id}>
            <FieldStyle>{__(`${paidAmount.type}`)}:</FieldStyle>
            <FormControl
              type="number"
              name={paidAmount._id}
              value={paidAmount.amount || 0}
            />
          </FlexRow>
        </li>
      );
    });
  };

  const renderDeliveryInfo = () => {
    const { order } = props;
    const { deliveryInfo } = order;
    if (!deliveryInfo) {
      return <></>;
    }

    return renderRow('Delivery info', deliveryInfo.description);
  };

  const generateLabel = (customer) => {
    const { firstName, primaryEmail, primaryPhone, lastName } =
      customer || ({} as ICustomer);

    let value = firstName ? firstName.toUpperCase() : '';

    if (lastName) {
      value = `${value} ${lastName}`;
    }
    if (primaryPhone) {
      value = `${value} (${primaryPhone})`;
    }
    if (primaryEmail) {
      value = `${value} /${primaryEmail}/`;
    }

    return value;
  };

  return (
    <SidebarList>
      {renderRow(
        `${(order.customerType || 'Customer').toLocaleUpperCase()}`,
        order.customer ? generateLabel(order.customer) : ''
      )}
      {renderRow('Bill Number', order.number)}
      {renderRow(
        'Date',
        dayjs(order.paidDate || order.createdAt).format('lll')
      )}
      {renderDeliveryInfo()}
      {order.syncErkhetInfo
        ? renderRow('Erkhet Info', order.syncErkhetInfo)
        : ''}

      {order.convertDealId
        ? renderRow(
            'Deal',
            <Link to={order.dealLink || ''}>{order.deal?.name || 'deal'}</Link>
          )
        : ''}
      <>
        {(order.putResponses || []).map((p) => {
          return (
            <DetailRow key={Math.random()}>
              {renderRow('Bill ID', p.billId)}
              {renderRow('Ebarimt Date', dayjs(p.date).format('lll'))}
            </DetailRow>
          );
        })}
      </>

      <Table>
        <thead>
          <tr>
            <th>{__('Product')}</th>
            <th>{__('Count')}</th>
            <th>{__('Unit Price')}</th>
            <th>{__('Amount')}</th>
            <th>{__('Diff')}</th>
          </tr>
        </thead>
        <tbody id="orderItems">
          {(order.items || []).map((item) => (
            <tr key={item._id}>
              <td>{item.productName}</td>
              <td>{item.count}</td>
              <td>{item.unitPrice}</td>
              <td>{item.count * item.unitPrice}</td>
              <td>{item.discountAmount}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {renderRow('Total Amount', displayValue(order, 'totalAmount'))}

      <ul>
        {renderEditRow('Cash Amount', 'cashAmount')}
        {renderEditRow('Mobile Amount', 'mobileAmount')}
        {renderEditPaid()}
      </ul>
    </SidebarList>
  );
};

export default OrderDetail;
