type Props = {
  price: any;
  action: string;
};

const Row = ({ price, action }: Props) => {
  const { Item_No, Unit_Price, Ending_Date, code, unitPrice } = price;

  const displayCode = action === 'DELETE' ? code : Item_No;
  const displayPrice = action === 'DELETE' ? unitPrice : Unit_Price;

  return (
    <tr className="border-b">
      <td className="p-2">{displayCode}</td>

      <td className="p-2">
        {parseFloat(displayPrice || 0).toLocaleString()}
      </td>

      <td className="p-2">
        {action === 'DELETE' ? '' : Ending_Date || ''}
      </td>

      <td className="p-2">
        {(action === 'UPDATE' || action === 'MATCH') && (
          <span className="text-green-600 font-medium">Synced</span>
        )}
      </td>
    </tr>
  );
};

export default Row;