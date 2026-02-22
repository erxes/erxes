import { IKhanbankTransactionItem } from '../types';

type Props = {
  transaction: IKhanbankTransactionItem;
};

const Row = ({ transaction }: Props) => {
  const formatTime = (time?: string) => {
    if (!time) return '00:00:00';

    return `${time.slice(0, 2)}:${time.slice(
      2,
      4,
    )}:${time.slice(4, 6)}`;
  };

  const beginBalance = (
    transaction.balance - transaction.amount
  ).toLocaleString();

  const isIncome = transaction.amount > 0;

  return (
    <tr className="border-b last:border-none hover:bg-muted/50 transition">
      <td className="px-4 py-3">
        <div className="font-medium">
          {transaction.tranDate}{' '}
          {formatTime(transaction.time)}
        </div>
      </td>

      <td className="px-4 py-3">
        {transaction.description}
      </td>

      <td className="px-4 py-3 text-right">
        {beginBalance}
      </td>

      <td className="px-4 py-3 text-right">
        {transaction.balance.toLocaleString()}
      </td>

      <td
        className={`px-4 py-3 text-right font-medium ${
          isIncome
            ? 'text-green-600'
            : 'text-red-600'
        }`}
      >
        {transaction.amount.toLocaleString()}
      </td>

      <td className="px-4 py-3">
        {transaction.relatedAccount}
      </td>
    </tr>
  );
};

export default Row;