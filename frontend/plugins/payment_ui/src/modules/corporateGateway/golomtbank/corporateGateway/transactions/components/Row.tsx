import dayjs from 'dayjs';
import { IGolomtBankTransactionItem } from '../../../types/ITransactions';

type Props = {
  transaction: IGolomtBankTransactionItem;
};

const Row = ({ transaction }: Props) => {
  const beginBalance = Number(
    transaction.balance - transaction.tranAmount,
  ).toLocaleString();

  const amount = transaction.tranAmount;
  const isIncome = amount > 0;

  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-4 text-xs text-muted-foreground">
        {dayjs(transaction.tranPostedDate).format('YYYY-MM-DD HH:mm:ss')}
      </td>

      <td className="py-2 pr-4">{transaction.tranDesc}</td>

      <td className="py-2 pr-4 text-right">{beginBalance}</td>

      <td className="py-2 pr-4 text-right">
        {transaction.balance.toLocaleString()}
      </td>

      <td
        className={`py-2 pr-4 text-right font-medium ${
          isIncome ? 'text-success' : 'text-destructive'
        }`}
      >
        {amount.toLocaleString()}
      </td>
    </tr>
  );
};

export default Row;
