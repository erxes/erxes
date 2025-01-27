import React from 'react';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import Component from '../../components/forms/Khanbank';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const CONFIGS_QUERY = gql`
  query KhanbankConfigs($page: Int, $perPage: Int) {
    khanbankConfigs(page: $page, perPage: $perPage) {
      _id
      name
    }
  }
`;

const ACCOUNTS_QUERY = gql`
  query KhanbankAccounts($configId: String!) {
    khanbankAccounts(configId: $configId) {
      name
      number
      currency
    }
  }
`;

const Khanbank = (props: Props) => {
  const { loading, error, data } = useQuery(CONFIGS_QUERY, {
    variables: {
      page: 1,
      perPage: 999,
    },
  });

  const [getAccounts, { data: accountsData, loading: accountsLoading }] =
    useLazyQuery(ACCOUNTS_QUERY, {
      fetchPolicy: 'network-only',
      variables: {
        configId: '',
      },
    });

  if (loading || accountsLoading) {
    return <Spinner />;
  }

  const onSelectConfig = (configId: string) => {
    getAccounts({
      variables: {
        configId,
      },
    });
  };

  const updatedProps = {
    ...props,
    configs: data.khanbankConfigs || [],
    accounts: accountsData?.khanbankAccounts || [],
    onSelectConfig,
  };

  return <Component {...updatedProps} />;
};

export default Khanbank;
