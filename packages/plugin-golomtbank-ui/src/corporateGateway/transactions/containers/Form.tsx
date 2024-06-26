import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import Alert from "@erxes/ui/src/utils/Alert";
import { gql } from "@apollo/client";
import React from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";

import TransactionForm from "../components/Form";
import { mutations, queries } from "../graphql";
import { IGolomtBankTransactionInput } from "../../../types/ITransactions";
import { AccountsListQueryResponse } from "../../../types/IGolomtAccount";

type Props = {
  configId: string;
  accountNumber?: string;
  accountList?: any;
  closeModal: () => void;
};

const TransactionFormContainer = (props: Props) => {
  const { configId } = props;
  // const list = useQuery<AccountsListQueryResponse>(gql(queries.accountsQuery), {
  //   fetchPolicy: "network-only",
  //   variables: { configId: configId },
  // });
  // console.log("data::::", list);
  const [transferMutation] = useMutation(gql(mutations.transferMutation), {
    refetchQueries: getRefetchQueries(),
  });

  // const [getHolderInfo, qryRes] = useLazyQuery(gql(queries.accountHolderQuery));

  // const getAccountHolder = (accountNumber: string, bankCode?: string) => {
  //   getHolderInfo({ variables: { accountNumber, configId, bankCode } });
  // };

  const submit = (
    configId,
    fromAccount,
    toAccount,
    toAccountName,
    fromBank,
    toBank,
    toCurrency,
    toDescription,
    fromDescription,
    fromCurrency,
    toAmount,
    fromAmount,
    type
  ) => {
    console.log(
      "translate::",
      "configId:",
      configId,
      "fromAccount",
      fromAccount,
      "toAccount:",
      toAccount,
      "toAccountName",
      toAccountName,
      "fromBank",
      fromBank,
      "toBank",
      toBank,
      "toCurrency",
      toCurrency,
      "toDescription",
      toDescription,
      "fromDescription",
      fromDescription,
      "fromCurrency",
      fromCurrency,
      "toAmount",
      toAmount,
      fromAmount,
      "type",
      type
    );
    transferMutation({
      variables: {
        configId,
        fromAccount,
        toAccount,
        toAccountName,
        fromBank,
        toBank,
        toCurrency,
        toDescription,
        fromDescription,
        fromCurrency,
        toAmount,
        fromAmount,
        type,
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
