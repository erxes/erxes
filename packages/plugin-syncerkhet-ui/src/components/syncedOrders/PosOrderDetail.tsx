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
  Table
} from '@erxes/ui/src';
import { DetailRow, FinanceAmount, FlexRow } from '../../styles';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';

type Props = {
  order: any;
};

class OrderDetail extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  displayValue(order, name) {
    const value = _.get(order, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  }

  renderRow(label, value) {
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <SidebarCounter>{value || '-'}</SidebarCounter>
        </FlexRow>
      </li>
    );
  }

  renderEditRow(label, key) {
    const { order } = this.props;
    const value = order[key];

    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <FormControl type="number" value={value} />
        </FlexRow>
      </li>
    );
  }

  renderEditPaid() {
    return this.props.order.paidAmounts.map(paidAmount => {
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
  }

  renderDeliveryInfo() {
    const { order } = this.props;
    const { deliveryInfo } = order;
    if (!deliveryInfo) {
      return <></>;
    }

    return this.renderRow('Delivery info', deliveryInfo.description);
  }

  generateLabel = customer => {
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

  render() {
    const { order } = this.props;

    return (
      <SidebarList>
        {this.renderRow(
          `${(order.customerType || 'Customer').toLocaleUpperCase()}`,
          order.customer ? this.generateLabel(order.customer) : ''
        )}
        {this.renderRow('Bill Number', order.number)}
        {this.renderRow(
          'Date',
          dayjs(order.paidDate || order.createdAt).format('lll')
        )}
        {this.renderDeliveryInfo()}
        {order.syncErkhetInfo
          ? this.renderRow('Erkhet Info', order.syncErkhetInfo)
          : ''}

        {order.convertDealId
          ? this.renderRow(
              'Deal',
              <Link to={order.dealLink || ''}>
                {order.deal?.name || 'deal'}
              </Link>
            )
          : ''}
        <>
          {(order.putResponses || []).map(p => {
            return (
              <DetailRow key={Math.random()}>
                {this.renderRow('Bill ID', p.billId)}
                {this.renderRow('Ebarimt Date', dayjs(p.date).format('lll'))}
              </DetailRow>
            );
          })}
        </>

        <Table whiteSpace="nowrap" bordered={true} hover={true}>
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
            {(order.items || []).map(item => (
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

        {this.renderRow(
          'Total Amount',
          this.displayValue(order, 'totalAmount')
        )}

        <ul>
          {this.renderEditRow('Cash Amount', 'cashAmount')}
          {this.renderEditRow('Mobile Amount', 'mobileAmount')}
          {this.renderEditPaid()}
        </ul>
      </SidebarList>
    );
  }
}

export default OrderDetail;
