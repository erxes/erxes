import * as dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import {
  __,
  FieldStyle,
  SidebarCounter,
  SidebarList,
  Table
} from '@erxes/ui/src';
import { Alert } from '@erxes/ui/src/utils';
import { DetailRow, FinanceAmount, FlexRow } from '../../styles';
import { IOrderDet } from '../types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IPos } from '../../types';

type Props = {
  onChangePayments: (
    _id: string,
    cashAmount: number,
    mobileAmount: number,
    paidAmounts: any[]
  ) => void;
  order: IOrderDet;
  pos: IPos;
};

type State = {
  cashAmount: number;
  mobileAmount: number;
  paidAmounts: any[];
};

class OrderDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { order, pos } = this.props;
    const paidAmounts: any[] = [...order.paidAmounts] || [];
    const paidKeys: string[] = paidAmounts.map(pa => pa.type);

    for (const emptyType of (pos.paymentTypes || []).filter(
      pt => !paidKeys.includes(pt.type)
    )) {
      paidAmounts.push({
        _id: Math.random().toString(),
        amount: 0,
        type: emptyType.type
      });
    }

    this.state = {
      paidAmounts,
      cashAmount: order.cashAmount,
      mobileAmount: order.mobileAmount
    };
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
    const value = this.state[key];
    const onChangeValue = e => {
      this.setState({ [key]: Number(e.target.value) } as any);
    };
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <FormControl type="number" onChange={onChangeValue} value={value} />
        </FlexRow>
      </li>
    );
  }

  onChangePaidAmount = e => {
    const { paidAmounts } = this.state;
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      paidAmounts: paidAmounts.map(pa =>
        pa._id === name ? { ...pa, amount: value } : pa
      )
    });
  };

  renderEditPaid() {
    const { paidAmounts } = this.state;
    return paidAmounts.map(paidAmount => {
      const { pos } = this.props;
      const { paymentTypes } = pos;

      return (
        <li key={paidAmount._id}>
          <FlexRow key={paidAmount._id}>
            <FieldStyle>
              {__(
                `${(
                  (paymentTypes || []).find(
                    pt => pt.type === paidAmount.type
                  ) || {}
                ).title || paidAmount.type}`
              )}
              :
            </FieldStyle>
            <FormControl
              type="number"
              name={paidAmount._id}
              onChange={this.onChangePaidAmount}
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

  save = () => {
    const { order } = this.props;
    const { totalAmount } = order;
    const { paidAmounts, cashAmount, mobileAmount } = this.state;

    if (
      cashAmount +
        mobileAmount +
        (paidAmounts || []).reduce(
          (sum, i) => Number(sum) + Number(i.amount),
          0
        ) !==
      totalAmount
    ) {
      Alert.error('Is not balanced');
      return;
    }

    this.props.onChangePayments(
      this.props.order._id,
      cashAmount,
      mobileAmount,
      (paidAmounts || []).filter(pa => Number(pa.amount) !== 0)
    );
  };

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

        <Button btnStyle="success" size="small" onClick={this.save} icon="edit">
          Save Payments Change
        </Button>
      </SidebarList>
    );
  }
}

export default OrderDetail;
