import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from '@apollo/client';

import Detail from '../components/Detail';
import queries from '../../graphql/queries';
import { AccountDetailQueryResponse } from '../../types/IGolomtAccount';

type Props = {
  queryParams: any;
} ;

const DetailContainer = (props: Props) => {
  const { _id, account } = props.queryParams;

  const { data, loading, error } = useQuery<AccountDetailQueryResponse>(
    gql(queries.detail),
    {
      variables: {
        configId: _id,
        accountId: account.account
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

  const accountDetail = {
    "requestId": "b0f9d6ab66ef475ba4393ff3c202eb14",
    "accountId": "1605172170",
    "accountName": "ОЧИР УНДРАА ОМЗ ББСБ",
    "shortName": "ОЧИР УНДРА",
    "currency": "MNT",
    "branchId": "814",
    "isSocialPayConnected": "N",
    "accountType": {
      "schemeCode": "CA658",
      "schemeType": "SBA"
    }}
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
