import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import Detail from '../components/Detail';
import queries from '../graphql/queries';
import { AccountDetailQueryResponse } from '../types';

type Props = {
  queryParams: any;
} & IRouterProps;

const DetailContainer = (props: Props) => {
  const { _id, account } = props.queryParams;

  const { data, loading, error } = useQuery<AccountDetailQueryResponse>(
    gql(queries.detailQuery),
    {
      variables: {
        configId: _id,
        accountNumber: account
      },
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
  }

  const accountDetail = data && data.khanbankAccountDetail;

  if (!accountDetail) {
    return null;
  }

  const extendedProps = {
    ...props,
    loading,
    account: accountDetail
  };

  return (
    <>
      <Detail {...extendedProps} />
    </>
  );
};

export default DetailContainer;
