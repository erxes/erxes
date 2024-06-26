import { RowTitle } from "@erxes/ui-engage/src/styles";
import React from "react";

import dayjs from "dayjs";
import { IGolomtBankTransactionItem } from "../../../types/ITransactions";

type Props = {
  transaction: IGolomtBankTransactionItem;
};

const Row = (props: Props) => {
  const { transaction } = props;

  const beginBalance = () => {
    return Number(
      transaction.balance - transaction.tranAmount
    ).toLocaleString();
  };

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>
          {dayjs(transaction?.tranPostedDate).format("YYYY-MM-DD HH:mm:ss")}
        </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{transaction.tranDesc}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{beginBalance()}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{transaction.balance.toLocaleString()}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{transaction.tranAmount.toLocaleString()}</RowTitle>
      </td>
    </tr>
  );
};

export default Row;
