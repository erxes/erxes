import * as dayjs from 'dayjs';
import _ from 'lodash';
import Button from '@erxes/ui/src/components/Button';
import Detail from '../containers/Detail';
import React from 'react';
import { ModalTrigger, confirm } from '@erxes/ui/src';
import { FinanceAmount } from '../../styles';
import { IOrder } from '../types';

type Props = {
  order: IOrder;
  history: any;
  onSyncErkhet: (orderId: string) => void;
  onReturnBill: (orderId: string) => void;
};

class PutResponseRow extends React.Component<Props> {
  displayValue(order, name) {
    const value = _.get(order, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  }

  syncErkhet = e => {
    const { order, onSyncErkhet } = this.props;
    e.stopPropagation();
    onSyncErkhet(order._id);
  };

  returnBill = e => {
    const { order, onReturnBill } = this.props;
    e.stopPropagation();

    const message = 'Are you sure?';

    confirm(message).then(() => {
      onReturnBill(order._id);
    });
  };

  modalContent = props => {
    const { order } = this.props;

    return <Detail order={order} />;
  };

  render() {
    const { order } = this.props;

    const onClick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr>
        <td key={'BillID'}>{order.number} </td>
        <td key={'Date'}>
          {dayjs(order.paidDate || order.createdAt).format('lll')}
        </td>
        <td key={'cashAmount'}>{this.displayValue(order, 'cashAmount')}</td>
        <td key={'cardAmount'}>{this.displayValue(order, 'cardAmount')}</td>
        <td key={'mobileAmount'}>{this.displayValue(order, 'mobileAmount')}</td>
        <td key={'totalAmount'}>{this.displayValue(order, 'totalAmount')}</td>
        <td key={'customer'}>
          {order.customer
            ? order.customer.primaryEmail ||
              order.customer.primaryPhone ||
              order.customer.firstName
            : ''}
        </td>
        <td key={'pos'}>{order.posName || ''}</td>
        <td key={'user'}>{order.user ? order.user.email : ''}</td>
        <td key={'actions'} onClick={onClick}>
          <Button
            btnStyle="success"
            size="small"
            icon="external-link-alt"
            onClick={this.syncErkhet}
          >
            {(order.syncedErkhet && 'Resync') || 'Sync'}
          </Button>

          <Button
            btnStyle="warning"
            size="small"
            icon="external-link-alt"
            onClick={this.returnBill}
          >
            Return
          </Button>
        </td>
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

export default PutResponseRow;
