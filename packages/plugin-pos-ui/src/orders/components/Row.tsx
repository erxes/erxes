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
  otherPayTitles: string[];
  onReturnBill: (orderId: string) => void;
};

const Row = (props: Props) => {
  const { order, otherPayTitles, onReturnBill } = props;

  const displayValue = (order, name) => {
    const value = _.get(order, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  };

  const displayPaid = (order, key) => {
    const { paidAmounts } = order;
    const value = (
      (paidAmounts || []).filter((pa) => pa.title === key || pa.type === key) ||
      []
    ).reduce((sum, pa) => sum + pa.amount, 0);
    return (
      <FinanceAmount key={Math.random()}>
        {(value || 0).toLocaleString()}
      </FinanceAmount>
    );
  };

  const returnBill = (e) => {
    e.stopPropagation();

    const message = 'Are you sure?';

    confirm(message).then(() => {
      onReturnBill(order._id);
    });
  };

  const modalContent = (_props) => {
    return <Detail orderId={order._id} posToken={order.posToken} />;
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const trigger = (
    <tr>
      <td key={'BillID'}>{order.number} </td>
      <td key={'Date'}>
        {dayjs(order.paidDate || order.createdAt).format('lll')}
      </td>
      <td key={'cashAmount'}>{displayValue(order, 'cashAmount')}</td>
      <td key={'mobileAmount'}>{displayValue(order, 'mobileAmount')}</td>
      {otherPayTitles.map((key) => (
        <td key={key}>{displayPaid(order, key)}</td>
      ))}
      <td key={'totalAmount'}>{displayValue(order, 'totalAmount')}</td>
      <td key={'customer'}>{order.customerType}</td>
      <td key={'pos'}>
        {order.posName || ''}
        {order.origin === 'kiosk' ? '*' : ''}
      </td>
      <td key={'type'}>{order.type || ''}</td>
      <td key={'user'}>{order.user ? order.user.email : ''}</td>
      <td key={'actions'} onClick={onClick}>
        {!order.returnInfo?.returnAt && (
          <Button
            btnStyle="warning"
            size="small"
            icon="external-link-alt"
            onClick={returnBill}
          >
            Return
          </Button>
        )}
      </td>
    </tr>
  );

  return (
    <ModalTrigger
      title={`Order detail`}
      trigger={trigger}
      autoOpenKey="showProductModal"
      content={modalContent}
      size={'lg'}
    />
  );
};

export default Row;
