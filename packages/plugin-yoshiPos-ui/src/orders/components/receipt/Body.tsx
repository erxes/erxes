import { IOrderItem } from '../../../orders/types';
import React from 'react';
import { __ } from '../../../common/utils';

type Props = {
  items: IOrderItem[];
};

export default class ReceiptBody extends React.Component<Props> {
  renderItem(item: IOrderItem) {
    const total = item.unitPrice * (item.count || 0);

    return (
      <tr key={Math.random()} className="detail-row">
        <td>{item.productName}</td>
        <td>
          {item.unitPrice.toLocaleString()} x{item.count}
        </td>
        <td className="totalCount">
          {' '}
          = <b>{total.toLocaleString()}</b>
        </td>
      </tr>
    );
  }

  render() {
    return (
      <table className="block">
        <thead>
          <tr className="detail-row">
            <th>{__('Inventory')}</th>
            <th>
              {__('Price')}/{__('Count')}
            </th>
            <th className="totalCount">{__('Total amount')}</th>
          </tr>
        </thead>
        <tbody>{this.props.items.map(item => this.renderItem(item))}</tbody>
      </table>
    );
  }
}
