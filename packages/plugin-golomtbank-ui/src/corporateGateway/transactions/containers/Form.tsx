import Alert from "@erxes/ui/src/utils/Alert";
import { gql } from "@apollo/client";
import React from "react";
import { useMutation } from "@apollo/client";
import TransactionForm from "../components/Form";
import { mutations, queries } from "../graphql";

type Props = {
  configId: string;
  accountNumber?: string;
  accountList?: any;
  closeModal: () => void;
};

const TransactionFormContainer = (props: Props) => {
  const [transferMutation] = useMutation(gql(mutations.transferMutation), {
    refetchQueries: getRefetchQueries(),
  });

  const submit = (
    configId,
    fromAccount,
    toAccount,
    toAccountName,
    toBank,
    toCurrency,
    toDescription,
    fromDescription,
    fromCurrency,
    toAmount,
    fromAmount
  ) => {
    transferMutation({
      variables: {
        configId,
        fromAccount,
        toAccount,
        toAccountName,
        toBank,
        toCurrency,
        toDescription,
        fromDescription,
        fromCurrency,
        toAmount,
        fromAmount,
      },
    })
      .then(() => {
        props.closeModal();
        window.location.reload();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    submit,
  };

  return <TransactionForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.transactionsQuery),
    },
  ];
};

export default TransactionFormContainer;
