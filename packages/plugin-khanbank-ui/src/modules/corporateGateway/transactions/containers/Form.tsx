import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import Alert from '@erxes/ui/src/utils/Alert';
import React from 'react';

import Spinner from '@erxes/ui/src/components/Spinner';
import TransactionForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { IKhanbankTransactionInput } from '../types';

type Props = {
  configId: string;
  accountNumber?: string;
  closeModal: () => void;
};

const TransactionFormContainer = (props: Props) => {
  const { configId } = props;

  const { data, loading } = useQuery(gql(queries.accountsQuery), {
    fetchPolicy: 'network-only',
    variables: { perPage: 9999, configId },
  });

  const [transferMutation] = useMutation(gql(mutations.transferMutation));

  const [getHolderInfo, qryRes] = useLazyQuery(gql(queries.accountHolderQuery));

  if (loading) {
    return <Spinner objective />;
  }

  const getAccountHolder = (accountNumber: string, bankCode?: string) => {
    getHolderInfo({ variables: { accountNumber, configId, bankCode } });
  };

  const submit = (transfer: IKhanbankTransactionInput) => {
    transferMutation({
      variables: {
        transfer,
        configId,
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

  const accountHolder = (qryRes.data && qryRes.data.khanbankAccountHolder) || {
    number: null,
    custLastName: '',
    custFirstName: '',
    currency: '',
  };

  if (qryRes.error) {
    Alert.error(qryRes.error.message);
  }

  const updatedProps = {
    ...props,
    accounts: data?.khanbankAccounts || [],
    accountHolder,
    accountLoading: qryRes.loading,
    getAccountHolder,
    submit,
  };

  return <TransactionForm {...updatedProps} />;
};

export default TransactionFormContainer;