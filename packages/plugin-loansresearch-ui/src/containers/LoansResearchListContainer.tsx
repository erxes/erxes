import { Alert, Bulk, router } from '@erxes/ui/src';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import LoansResearchList from '../components/LoansResearchList';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { mutations, queries } from '../graphql';
import { MainQueryResponse, RemoveMutationResponse } from '../types';

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

  const [loanResearchRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.loansResearchRemove),
    generateOptions()
  );

  if (loansResearchMainQuery.loading) {
    return <Spinner />;
  }

  const removeLResearch = ({ loanResearchIds }, emptyBulk) => {
    loanResearchRemove({
      variables: { loanResearchIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success('You successfully deleted a research');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const { list = [], totalCount = 0 } =
    loansResearchMainQuery?.data?.loansResearchMain || {};

  const updatedProps = {
    ...props,
    loading: loansResearchMainQuery.loading,
    totalCount,
    loanResearches: list,
    removeLResearch,
  };

  const content = (bulkProps) => (
    <LoansResearchList {...updatedProps} {...bulkProps} />
  );

  const refetch = () => {
    loansResearchMainQuery.refetch();
  };

  return <Bulk content={content} refetch={refetch} />;
};

const generateOptions = () => ({
  refetchQueries: ['loansResearchMain'],
});

export default LoansResearchListContainer;
