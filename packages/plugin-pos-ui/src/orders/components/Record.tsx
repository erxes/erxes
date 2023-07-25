import * as dayjs from 'dayjs';
import _ from 'lodash';
import Detail from '../containers/Detail';
import React from 'react';
import { ModalTrigger } from '@erxes/ui/src';
import { FinanceAmount } from '../../styles';
import { IOrder } from '../types';

type Props = {
  order: IOrder;
  history: any;
  otherPayTitles: string[];
};

class Record extends React.Component<Props> {
  displayValue(order, name) {
    const value = _.get(order, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  }

  generateLabel = customer => {
    const { firstName, primaryEmail, primaryPhone, lastName } =
      customer || ({} as any);

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

  displayPaid(order, key) {
    const { paidAmounts } = order;
    const value = (
      (paidAmounts || []).filter(pa => pa.title === key || pa.type === key) ||
      []
    ).reduce((sum, pa) => sum + pa.amount, 0);
    return (
      <FinanceAmount key={Math.random()}>
        {(value || 0).toLocaleString()}
      </FinanceAmount>
    );
  }

  modalContent = _props => {
    const { order } = this.props;

    return <Detail order={{ ...order, _id: order._id.split('_')[0] }} />;
  };

  render() {
    const { order } = this.props;
    const trigger = (
      <tr>
        <td key={'Date'}>
          {dayjs(order.paidDate || order.createdAt).format('YYYY-MM-DD')}
        </td>
        <td key={'Time'}>
          {dayjs(order.paidDate || order.createdAt).format('HH-mm-ss')}
        </td>
        <td key={'BillID'}>{order.number} </td>
        <td key={'pos'}>
          {order.posName || ''}
          {order.origin === 'kiosk' ? '*' : ''}
        </td>
        <td key={'branchId'}>
          {' '}
          {`${order.branch?.code || ''} - ${order.branch?.title || ''}` ||
            ''}{' '}
        </td>
        <td key={'departmentId'}>
          {' '}
          {`${order.department?.code || ''} - ${order.department?.title ||
            ''}` || ''}{' '}
        </td>
        <td key={'user'}>{order.user ? order.user.email : ''}</td>
        <td key={'type'}>{order.type || ''}</td>
        <td key={'billType'}>{order.billType || ''}</td>
        <td key={'registerNumber'}>{order.registerNumber || ''}</td>
        <td key={'customerType'}>{order.customerType || ''}</td>
        <td key={'customer'}>{this.generateLabel(order.customer) || ''}</td>
        <td key={'barcode'}>{order.items?.product?.barcodes?.[0] || ''}</td>
        <td key={'factor'}>
          {(order.items?.manufactured &&
            dayjs(order.items?.manufactured).format('YYYY-MM-DD HH:mm')) ||
            ''}
        </td>
        <td key={'code'}>{order.items?.product?.code || ''}</td>
        <td key={'category'}>{order.items?.product?.code || ''}</td>
        <td key={'subCategory'}>{order.items?.product?.code || ''}</td>
        <td key={'name'}>{order.items?.product?.name || ''}</td>
        <td key={'count'}>{order.items?.count || 0}</td>
        <td key={'firstPrice'}>
          {((order.items?.count || 0) * (order.items?.unitPrice || 0) +
            (order.items?.discountAmount || 0)) /
            (order.items?.count || 1)}
        </td>
        <td key={'discountAmount'}>{order.items?.discountAmount || 0}</td>
        <td key={'discountType'}>{order.items?.discountType || ''}</td>
        <td key={'unitPrice'}>{order.items?.unitPrice || 0}</td>
        <td key={'amount'}>
          {(order.items?.count || 0) * (order.items?.unitPrice || 0)}
        </td>
        <td key={'amountType'}>
          {[
            ...Array.from(
              new Set(
                [
                  ...order.paidAmounts,
                  { type: 'cash', amount: order.cashAmount },
                  { type: 'mobile', amount: order.mobileAmount }
                ]
                  .filter(pa => pa.amount > 0)
                  .map(pa => pa.type)
              )
            )
          ].join(', ')}
        </td>
        <td></td>
      </tr>
    );

    return (
      <ModalTrigger
        title={`Order detail`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
        size={'lg'}
      />
    );
  }
}

export default Record;
