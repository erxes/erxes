import { router } from '@erxes/ui/src';
import Spinner from '@erxes/ui/src/components/Spinner';
import dayjs from 'dayjs';
import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from '@apollo/client';

import List from '../components/List';
import { queries } from '../graphql';
import { StatementQueryResponse } from '../types';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import { getRawAccountNumber } from '../../../../utils';

type Props = {
  queryParams: any;
  showLatest?: boolean;
  refetch?: () => void;
};

export default function ListContainer(props: Props) {
  const { queryParams, showLatest } = props;

  let { page, perPage } = router.generatePaginationParams(queryParams || {});
  let startDate = queryParams.startDate;
  let endDate = queryParams.endDate;
  // access_token_expired

  if (showLatest) {
    page = 1;
    perPage = 10;

    startDate = dayjs(new Date().setDate(new Date().getDate() - 1)).format(
      'YYYY-MM-DD'
    );
    endDate = dayjs(new Date()).format('YYYY-MM-DD');
  }

  const { data, loading, error } = useQuery<StatementQueryResponse>(
    gql(queries.transactionsQuery),
    {
      variables: {
        page,
        perPage,
        accountNumber: getRawAccountNumber(queryParams.account),
        configId: queryParams._id,
        startDate,
        endDate,
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

  const statement = data && data.khanbankStatements;

  if (!statement) {
    return null;
  }

  const extendedProps = {
    ...props,
    loading: !statement.transactions ? false : loading,
    statement,
  };

  return <List {...extendedProps} />;
}
