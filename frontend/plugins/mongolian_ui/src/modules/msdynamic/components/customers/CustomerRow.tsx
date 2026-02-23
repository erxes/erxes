type Props = {
  customers: any;
  action: string;
};

const CustomersRow = ({ customers, action }: Props) => {
  const { Name, No, primaryName, firstName, code, syncStatus } = customers;

  return (
    <tr>
      <td>{action === 'DELETE' ? code : No}</td>
      <td>{action === 'DELETE' ? primaryName || firstName : Name}</td>
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

export default CustomersRow;
