import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Alert from '@erxes/ui/src/utils/Alert';
import { gql } from '@apollo/client';
import React from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';

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

  const { data } = useQuery(gql(queries.accountsQuery), {
    fetchPolicy: 'network-only',
    variables: { perPage: 9999, configId }
  });

  const [transferMutation] = useMutation(gql(mutations.transferMutation), {
    refetchQueries: getRefetchQueries()
  });

  const [getHolderInfo, qryRes] = useLazyQuery(gql(queries.accountHolderQuery));

  const getAccountHolder = (accountNumber: string, bankCode?: string) => {
    getHolderInfo({ variables: { accountNumber, configId, bankCode } });
  };

  const submit = (transfer: IKhanbankTransactionInput) => {
    transferMutation({
      variables: {
        transfer,
        configId
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

  const accountHolder = (qryRes.data && qryRes.data.khanbankAccountHolder) || {
    number: null,
    custLastName: '',
    custFirstName: '',
    currency: ''
  };

  if (qryRes.error) {
    Alert.error(qryRes.error.message);
  }

  const updatedProps = {
    ...props,
    accounts: (data && data.khanbankAccounts) || [],
    accountHolder,
    getAccountHolder,
    submit
  };

  return <TransactionForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.transactionsQuery)
    }
  ];
};

export default TransactionFormContainer;
