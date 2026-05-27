type Props = {
  product: any;
  action: string;
};

const Row = ({ product, action }: Props) => {
  const { Description, No, name, code, unitPrice, Unit_Price, syncStatus } =
    product;

  const displayCode = action === 'DELETE' ? code : No;
  const displayName = action === 'DELETE' ? name : Description;
  const price = action === 'DELETE' ? unitPrice : Unit_Price;

  return (
    <tr className="border-b">
      <td className="p-2">{displayCode}</td>
      <td className="p-2">{displayName}</td>
      <td className="p-2">{parseFloat(price || 0).toLocaleString()}</td>

      <td className="p-2">
        {syncStatus !== false && (
          <span className="text-green-600 font-medium">Synced</span>
        )}
      </td>
    </tr>
  );
};

export default Row;
