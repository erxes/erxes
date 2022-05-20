import React from 'react';

import { IOrder } from '../../../orders/types';
import { __ } from '../../../common/utils';
import { PaymentInfo } from '../../../orders/styles';
import { formatNumber } from '../../../utils';

type Props = {
  order: IOrder | null;
  remainderAmount: number;
  companyName: string;
  registerNumber: string;
  color?: string;
};

export default function OrderInfo({
  order,
  remainderAmount,
  companyName,
  registerNumber,
  color
}: Props) {
  if (!order) {
    return null;
  }

  return (
    <PaymentInfo color={color}>
      <div>
        <span>
          <b>{__('Payment info')}</b>
        </span>
        <span>
          <b>№: {order && order.number ? order.number.split('_')[1] : ''}</b>
        </span>
      </div>
      {companyName && (
        <div>
          <span>
            <b>{__('Entity name')}</b>
          </span>
          <span>
            <b>{companyName}</b>
          </span>
        </div>
      )}
      {registerNumber && (
        <div>
          <span>
            <b>{__('Register number')}</b>
          </span>
          <span>
            <b>{registerNumber}</b>
          </span>
        </div>
      )}

      <div className="middle">
        {order.cardAmount ? (
          <div>
            <span>{__('Paid card amount')}</span>
            <b>{formatNumber(order.cardAmount || 0)}₮</b>
          </div>
        ) : null}
        {order.mobileAmount && (
          <div>
            <span>{__('Paid mobile amount')}</span>
            <b>{formatNumber(order.mobileAmount || 0)}₮</b>
          </div>
        )}
        {order.cashAmount && (
          <div>
            <span>{__('Paid cash amount')}</span>
            <b>{formatNumber(order.cashAmount || 0)}₮</b>
          </div>
        )}
        {remainderAmount > 0 && (
          <div>
            <span>{__('Remainder amount')}</span>
            <b>{formatNumber(remainderAmount || 0)}₮</b>
          </div>
        )}
      </div>
      <div>
        <span>
          <b>{__('Total amount')}</b>
        </span>
        <span>
          <b>{formatNumber(order.totalAmount || 0)}₮</b>
        </span>
      </div>
    </PaymentInfo>
  );
}
