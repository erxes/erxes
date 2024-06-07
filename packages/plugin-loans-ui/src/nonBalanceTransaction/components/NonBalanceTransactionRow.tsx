import {
  Bulk,
  Button,
  Icon,
  ModalTrigger,
  Tip,
  __,
} from "@erxes/ui/src";
import React from "react";
import DetailForm from "./DetailForm";
import { INonBalanceTransaction } from "../types";
import dayjs from "dayjs";

type Props = {
  nonBalanceTransaction: INonBalanceTransaction;
  isChecked: boolean;
  toggleBulk: (
    nonBalanceTransaction: INonBalanceTransaction,
    isChecked?: boolean
  ) => void;
};
function nonBalanceTransactionRow({
  nonBalanceTransaction
}: Props) {
   
  const checkForm = () => {
    const content = () => {
      return <DetailForm nonBalanceTransaction={nonBalanceTransaction} />;
    };
    return <Bulk content={content} />;
  };

  return (
      <tr>
        <td key={'contractId'}>
          {(nonBalanceTransaction && nonBalanceTransaction?.contract?.number) ||
            ''}
        </td>
        <td key={'description'}>{nonBalanceTransaction.description || ''} </td>
        <td key={'customerId'}>{(nonBalanceTransaction && nonBalanceTransaction?.customer?.firstName) || ''}</td>
        <td key={'transactionType'}>{(nonBalanceTransaction && nonBalanceTransaction.transactionType) ||''} </td>
        <td key={'createdAt'}>{dayjs(nonBalanceTransaction && nonBalanceTransaction.createdAt).format('lll') || ''}</td>
        <td>
          <div>
            <ModalTrigger
              size="xl"
              title={__('Non Balance Transaction Detail')}
              trigger={
                <Button btnStyle="link">
                  <Tip text="View" placement="top">
                    <Icon icon="eye" />
                  </Tip>
                </Button>
              }
              content={checkForm}
              dialogClassName="wide-modal"
            />
          </div>
        </td>
      </tr>
  );
}
export default nonBalanceTransactionRow;
