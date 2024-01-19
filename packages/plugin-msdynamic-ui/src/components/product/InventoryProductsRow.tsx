import React from 'react';

type Props = {
  product: any;
  action: any;
};

const Row = ({ product, action }: Props) => {
  const {
    Description,
    No,
    name,
    code,
    unitPrice,
    Unit_Price,
    syncStatus
  } = product;

  return (
    <tr>
      <td>{action === 'DELETE' ? code : No}</td>
      <td>{action === 'DELETE' ? name : Description}</td>
      <td>{parseFloat(action === 'DELETE' ? unitPrice : Unit_Price)}</td>
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
};

export default Row;
