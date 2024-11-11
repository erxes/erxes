import { ButtonMutate } from "@erxes/ui/src";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IInvoice } from "../../invoices/types";
import { ITransaction } from "../types";
import LoanGive from "../components/TransactionFormGive";
import LoanRepayment from "../components/TransactionFormRepayment";
import React from "react";
import { __ } from "coreui/utils";
import { mutations } from "../graphql";

type Props = {
  contractId?: string;
  lockContract?: boolean;
  transaction: ITransaction;
  type: string;
  invoice?: IInvoice;
  getAssociatedTransaction?: (transactionId: string) => void;
  closeModal: () => void;
};

const TransactionFromContainer = (props: Props) => {
  const { transaction, closeModal, getAssociatedTransaction } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeModal();

      if (getAssociatedTransaction) {
        getAssociatedTransaction(data.transactionsAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={
          object && object._id
            ? mutations.transactionsEdit
            : mutations.transactionsAdd
        }
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={
          `You successfully ${object ? "updated" : "added"} a ${name}`
        }
      >
        {__("Save")}
      </ButtonMutate>
    );
  };

  // const invoice = invoiceDetailQuery.invoiceDetail;

  const updatedProps = {
    ...props,
    renderButton,
    // invoice,
    transaction: { ...transaction },
  };

  if (props.type === "give") return <LoanGive {...updatedProps} />;
  return <LoanRepayment {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ["activityLogs", "schedules", "transactionsMain"];
};

export default TransactionFromContainer;
