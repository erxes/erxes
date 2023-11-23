import React from 'react';

type Props = {
  product: any;
  action: any;
};

class Row extends React.Component<Props> {
  render() {
    const { product, action } = this.props;

    const onTrClick = () => {};

    const { name, code, barcodes, unit_price, unitPrice, syncStatus } = product;

    return (
      <tr onClick={onTrClick}>
        <td>{code}</td>
        <td>{name}</td>
        <td>{barcodes}</td>
        <td>{parseFloat(unit_price || unitPrice)}</td>
        {action === 'CREATE' ? (
          <td>
            {syncStatus === false ? (
              <></>
            ) : (
              <span style={{ color: '#27ae60' }}> Synced </span>
            )}
          </td>
        ) : (
          <></>
        )}
        {action === 'UPDATE' ? (
          <td>
            {syncStatus === false ? (
              <></>
            ) : (
              <span style={{ color: '#27ae60' }}> Synced </span>
            )}
          </td>
        ) : (
          <></>
        )}
        {action === 'DELETE' ? (
          <td>
            {syncStatus === false ? (
              <></>
            ) : (
              <span style={{ color: '#27ae60' }}> Synced </span>
            )}
          </td>
        ) : (
          <></>
        )}
      </tr>
    );
  }
}

export default Row;
