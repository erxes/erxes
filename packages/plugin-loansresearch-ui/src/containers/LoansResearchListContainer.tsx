import { Bulk, router } from '@erxes/ui/src';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import LoansResearchList from '../components/LoansResearchList';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { queries } from '../graphql';
import { MainQueryResponse } from '../types';

type Props = {
  queryParams: any;
};

const LoansResearchListContainer = (props: Props) => {
  const { queryParams } = props;

  const loansResearchMainQuery = useQuery<MainQueryResponse>(
    gql(queries.loansResearchMain),
    {
      variables: {
        ...router.generatePaginationParams(queryParams || {}),
        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined,
      },
      fetchPolicy: 'network-only',
    }
  );

  if (loansResearchMainQuery.loading) {
    return <Spinner />;
  }

  const { list = [], totalCount = 0 } =
    loansResearchMainQuery?.data?.loansResearchMain || {};

  const updatedProps = {
    ...props,
    loading: loansResearchMainQuery.loading,
    totalCount,
    loanResearch: list,
  };

  const content = (bulkProps) => (
    <LoansResearchList {...updatedProps} {...bulkProps} />
  );

  const refetch = () => {
    loansResearchMainQuery.refetch();
  };

  return <Bulk content={content} refetch={refetch} />;
};

export default LoansResearchListContainer;
