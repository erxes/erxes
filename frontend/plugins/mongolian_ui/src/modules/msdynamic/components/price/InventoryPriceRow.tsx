type Props = {
  price: any;
  action: any;
};

const Row = ({ price, action }: Props) => {
  const { Item_No, Unit_Price, Ending_Date, code, unitPrice, syncStatus } =
    price;

  return (
    <tr>
      <td>{action === 'DELETE' ? code : Item_No}</td>
      <td>{parseFloat(action === 'DELETE' ? unitPrice : Unit_Price)}</td>
      <td>{action === 'DELETE' ? '' : Ending_Date}</td>

      {action === 'UPDATE' || action === 'MATCH' ? (
        <td>
          <span style={{ color: '#27ae60' }}> Synced </span>
        </td>
      ) : (
        <></>
      )}
    </tr>
  );
};

export default Row;
