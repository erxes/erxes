type Props = {
  category: any;
  action: string;
};

const Row = ({ category, action }: Props) => {
  const { Code, Description, name, code, description, syncStatus } = category;

  const displayCode = action === 'DELETE' ? code : Code;
  const displayName = action === 'DELETE' ? name : Code;
  const displayDescription = action === 'DELETE' ? description : Description;

  return (
    <tr className="border-b">
      <td className="p-2">{displayCode}</td>
      <td className="p-2">{displayName}</td>
      <td className="p-2">{displayDescription}</td>

      <td className="p-2">
        {syncStatus !== false && (
          <span className="text-green-600 font-medium">Synced</span>
        )}
      </td>
    </tr>
  );
};

export default Row;
