import Alert from "@erxes/ui/src/utils/Alert";
import { useMutation, gql } from "@apollo/client";
import React from "react";
import TransactionForm from "../components/Form";
import { mutations, queries } from "../graphql";
import { IGolomtBankTransactionInput } from "../../../types/ITransactions";

type Props = {
  configId: string;
  accountNumber?: string;
  accountList?: any;
  accountName: string;
  closeModal: () => void;
};

const TransactionFormContainer = (props: Props) => {
  const [transferMutation] = useMutation(gql(mutations.transferMutation), {
    refetchQueries: getRefetchQueries(props.configId, props.accountNumber)
  });
  const submit = (transfer: IGolomtBankTransactionInput) => {
    transferMutation({
      variables: {
        transfer: transfer,
        configId: props.configId
      }
    })
      .then(() => {
        props.closeModal();
        window.location.reload();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    submit
  };

  return <TransactionForm {...updatedProps} />;
};

const getRefetchQueries = (configId?: string, accountNumber?: string) => {
  return [
    {
      query: gql(queries.transactionsQuery),
      variables: {
        accountId: accountNumber,
        configId: configId
      }
    }
  ];
};

export default TransactionFormContainer;
