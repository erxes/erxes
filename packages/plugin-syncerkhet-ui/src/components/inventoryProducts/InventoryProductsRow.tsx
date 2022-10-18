import React from 'react';

type Props = {
  product: any;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const { product } = this.props;

    const onTrClick = () => {};

    const { name, code, barcode, unit_price } = product;

    return (
      <tr onClick={onTrClick}>
        <td>{code}</td>
        <td>{name}</td>
        <td>{barcode}</td>
        <td>{parseFloat(unit_price)}</td>
      </tr>
    );
  }
}

export default Row;
