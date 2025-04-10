import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from '@apollo/client';

import Detail from '../components/Detail';
import queries from '../graphql/queries';
import { AccountDetailQueryResponse } from '../types';
import { getRawAccountNumber } from '../../../../utils';

type Props = {
  queryParams: any;
};

const DetailContainer = (props: Props) => {
  const { _id, account } = props.queryParams;


  const { data, loading, error } = useQuery<AccountDetailQueryResponse>(
    gql(queries.detailQuery),
    {
      variables: {
        configId: _id,
        accountNumber: getRawAccountNumber(account),
      },
      fetchPolicy: 'network-only',
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
    account: accountDetail,
  };

  return (
    <>
      <Detail {...extendedProps} />
    </>
  );
};

export default DetailContainer;
