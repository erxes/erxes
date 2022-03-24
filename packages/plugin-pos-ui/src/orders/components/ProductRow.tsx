import React from 'react';
import { IPosProduct } from '../types';

type Props = {
  product: IPosProduct;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const { product } = this.props;
    const {
      code,
      name,
      category,
      unitPrice,
      count
    } = product;

    return (
      <tr>
        <td>{code}</td>
        <td>{name}</td>
        <td>{category ? category.name : ''}</td>
        <td>{(unitPrice || 0).toLocaleString()}</td>
        <td>{(count || 0).toLocaleString()}</td>
      </tr>
    );
  }
}

export default Row;
