import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useEffect } from 'react';

import TransactionForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { IKhanbankTransactionInput } from '../types';

type Props = {
  configId: string;
  accountNumber?: string;
  closeModal: () => void;
};

const TransactionFormContainer = ({
  configId,
  accountNumber,
  closeModal,
}: Props) => {
  const { data, loading, error } = useQuery(
    gql(queries.accountsQuery),
    {
      fetchPolicy: 'network-only',
      variables: { perPage: 9999, configId },
    },
  );

  const [transferMutation, { loading: transferLoading }] =
    useMutation(gql(mutations.transferMutation));

  const [getHolderInfo, holderQuery] =
    useLazyQuery(gql(queries.accountHolderQuery));

  const getAccountHolder = (
    accountNumber: string,
    bankCode?: string,
  ) => {
    getHolderInfo({
      variables: {
        accountNumber,
        configId,
        bankCode,
      },
    });
  };

  const submit = async (
    transfer: IKhanbankTransactionInput,
  ) => {
    try {
      await transferMutation({
        variables: {
          transfer,
          configId,
        },
      });

      closeModal();
      // ❌ no full page reload anymore
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const accountHolder =
    holderQuery.data?.khanbankAccountHolder ?? {
      number: '',
      custLastName: '',
      custFirstName: '',
      currency: '',
    };

  useEffect(() => {
    if (holderQuery.error) {
      console.error(
        holderQuery.error.message,
      );
    }
  }, [holderQuery.error]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        Loading accounts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive p-4">
        {error.message}
      </div>
    );
  }

  return (
    <TransactionForm
      configId={configId}
      accountNumber={accountNumber}
      closeModal={closeModal}
      accounts={data?.khanbankAccounts ?? []}
      accountHolder={accountHolder}
      accountLoading={holderQuery.loading}
      getAccountHolder={getAccountHolder}
      submit={submit}
    />
  );
};

export default TransactionFormContainer;