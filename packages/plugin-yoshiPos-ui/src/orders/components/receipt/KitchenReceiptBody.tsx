import dayjs from 'dayjs';
import React from 'react';
import { __ } from '../../../common/utils';
import { IOrder } from '../../../orders/types';
import { ReceiptWrapper } from './styles';

type Props = {
  order: IOrder;
  logo: string;
  name: string;
};

export default class KitchenReceiptBody extends React.Component<Props> {
  render() {
    const { order, logo, name } = this.props;

    return (
      <ReceiptWrapper className="printDocument">
        <div className="receipt-logo">
          <img src={logo} alt={name} width={'32px'} height={'32px'} />
          <h5>
            <b>{name}</b>
          </h5>
          <h2>
            <b>&#8470;:</b>
            {order.number.split('_')[1]}
          </h2>
        </div>
        <p>
          <b>{__('Date')}:</b>
          {order.paidDate ? (
            <span>{dayjs(order.paidDate).format('YYYY.MM.DD HH:mm')}</span>
          ) : null}
        </p>
        <table>
          <thead>
            <tr>
              <th>{__('Inventory')}</th>
              <th>{__('Count')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item._id}>
                <td>{item.productName}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReceiptWrapper>
    );
  }

  componentDidMount() {
    window.addEventListener('afterprint', () => {
      window.close();
    });
    setTimeout(() => {
      window.print();
    }, 10);
  }

  componentWillUnmount() {
    window.removeEventListener('afterprint', () => {});
  }
}
