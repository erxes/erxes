import React from 'react';
import { IConfig } from 'types';
import { IOrder } from '../../orders/types';
import { IUser } from 'modules/auth/types';
import { OrderCard } from '../styles';
import { useTime } from 'react-timer-hook';

type Props = {
  editOrder: (doc) => void;
  posCurrentUser: IUser;
  currentConfig: IConfig;
  order: IOrder;
};

function Timer({ startTime, waitingSec, order, editOrder }) {
  const { seconds, minutes, hours } = useTime({});

  const time = seconds + minutes * 60 + (hours || 24) * 3600;

  let diffSec = time - startTime;

  if (diffSec < 0) {
    diffSec = diffSec + 24 * 60 * 60;
  }

  if (diffSec > waitingSec) {
    editOrder({ _id: order._id, status: 'complete', number: order.number });
    return <></>;
  }
  return <span>{diffSec || 60}</span>;
}

export default class OrderDetail extends React.Component<Props> {
  render() {
    const { currentConfig, order, editOrder } = this.props;
    const { waitingScreen, uiOptions } = currentConfig;
    const color = uiOptions.colors.primary;
    const waitingSec = parseInt(waitingScreen.value) * 60;

    const date = new Date(order.modifiedAt);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const startTime = seconds + minutes * 60 + hours * 3600;

    return (
      <OrderCard color={color}>
        {order.number.split('_')[1]}
        <p>
          <Timer
            startTime={startTime}
            waitingSec={waitingSec}
            order={order}
            editOrder={editOrder}
          />
        </p>
      </OrderCard>
    );
  } // end render()
}
