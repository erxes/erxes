import React from 'react';
import { IRemainderProduct } from '../types';

type Props = {
  product: IRemainderProduct;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const { product } = this.props;
    const { code, name, category, unitPrice, remainder, uom } = product;

    return (
      <tr>
        <td>{code}</td>
        <td>{name}</td>
        <td>{category ? category.name : ''}</td>
        <td>{(unitPrice || 0).toLocaleString()}</td>
        <td>{(remainder || 0).toLocaleString()}</td>
        <td>{(uom && uom.name) || ''}</td>
      </tr>
    );
  }
}

export default Row;
