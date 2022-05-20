import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import { AppContext } from '../../../../appContext';
import { FlexCenter, FlexBetween } from '../../../common/styles/main';
import colors from '../../../common/styles/colors';
import Tip from '../../../common/components/Tip';
import { OrderBox, OrderBoxItem } from '../../../orders/styles';
import Icon from '../../../common/components/Icon';
import { formatNumber } from '../../../utils';
import { IOrder } from '../../types';
import { __ } from '../../../common/utils';

type Props = {
  order: IOrder;
  orientation: string;
};

export default function OrderItem({ order, orientation }: Props) {
  const { currentConfig } = React.useContext(AppContext);
  const options = currentConfig && currentConfig.uiOptions;

  if (!order) {
    return null;
  }

  const number = order.number.split('_');
  const firstLetter = order.type.charAt(0).toUpperCase();
  const type = `${firstLetter}${order.type.substring(1, order.type.length)}`;

  const onClick = () => (window.location.href = `/pos?id=${order._id}`);

  const color = order.paidDate ? colors.colorCoreGreen : options.colors.primary;

  return (
    <OrderBoxItem>
      <OrderBox
        isPortrait={orientation === 'portrait'}
        color={color}
        key={order._id}
        type={type}
        onClick={onClick}
      >
        <Link to={`/pos?id=${order._id}`}>
          <FlexBetween>
            <span>{dayjs(order.createdAt).format('YY/MM/DD')}</span>
            <Tip text={`${__('Number')}: ${number[1]}`}>
              <span>
                <b>#{number[1]}</b>
              </span>
            </Tip>
          </FlexBetween>
        </Link>
        <FlexCenter>
          <span>
            <Icon icon="wallet" size={12} />
            <b>{formatNumber(order.totalAmount)}₮</b>
          </span>
          <label>{__(type) || 'Take'}</label>
        </FlexCenter>
      </OrderBox>
    </OrderBoxItem>
  );
}
