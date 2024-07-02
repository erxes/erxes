import Alert from "@erxes/ui/src/utils/Alert";
import { useMutation, gql } from "@apollo/client";
import React from "react";
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
    refetchQueries: getRefetchQueries(props.configId, props.accountNumber),
  });

  const submit = ({
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
    refCode,
  }) => {
    transferMutation({
      variables: {
        configId: configId,
        fromAccount: fromAccount,
        toAccount: toAccount,
        toAccountName: toAccountName,
        toBank: toBank,
        toCurrency: toCurrency,
        toDescription: toDescription,
        fromDescription: fromDescription,
        fromCurrency: fromCurrency,
        toAmount: toAmount,
        fromAmount: fromAmount,
        refCode: refCode,
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

const getRefetchQueries = (configId?: string, accountNumber?: string) => {
  return [
    {
      query: gql(queries.transactionsQuery),
      variables: {
        accountId: accountNumber,
        configId: configId,
      },
    },
  ];
};

export default TransactionFormContainer;
