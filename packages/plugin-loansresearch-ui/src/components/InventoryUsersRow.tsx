import React from 'react';

type Props = {
  user: any;
  action: any;
};

const Row = ({ user, action }: Props) => {
  const { sn, givenName, sAMAccountName, details, email, syncStatus } = user;

  return (
    <tr>
      <td>{action === 'INACTIVE' ? email : sAMAccountName}</td>
      <td>{action === 'INACTIVE' ? details?.firstName : givenName}</td>
      <td>{action === 'INACTIVE' ? details?.lastName : sn}</td>
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
      {action === 'INACTIVE' ? (
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
