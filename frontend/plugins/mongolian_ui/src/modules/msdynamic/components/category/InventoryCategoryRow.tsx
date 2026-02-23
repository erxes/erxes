type Props = {
  category: any;
  action: any;
};

const Row = ({ category, action }: Props) => {
  const { Description, Code, name, code, description, syncStatus } = category;

  return (
    <tr>
      <td>{action === 'DELETE' ? code : Code}</td>
      <td>{action === 'DELETE' ? name : Code}</td>
      <td>{action === 'DELETE' ? description : Description}</td>
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
