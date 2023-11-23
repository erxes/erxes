import React from 'react';

type Props = {
  category: any;
  action: string;
};

class Row extends React.Component<Props> {
  render() {
    const { category, action } = this.props;

    const onTrClick = () => {};

    const { name, code, syncStatus } = category;

    return (
      <tr onClick={onTrClick}>
        <td>{code}</td>
        <td>{name}</td>
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
