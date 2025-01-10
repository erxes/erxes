import { Alert, Bulk, router } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import React, { useState } from 'react';

import ContractTypesList from '../components/ContractTypesList';
import { mutations, queries } from '../graphql';
import { MainQueryResponse, RemoveMutationResponse } from '../types';
import { useMutation, useQuery } from '@apollo/client';

type Props = {
  queryParams: any;
};

const ContractTypeListContainer = (props: Props) => {
  const { queryParams } = props;

  const contractTypesMainQuery = useQuery<MainQueryResponse>(
    gql(queries.contractTypesMain),
    {
      variables: {
        ...router.generatePaginationParams(queryParams || {}),
        ids: queryParams.ids,
        searchValue: queryParams.searchValue,
        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [contractTypesRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.contractTypesRemove),
    {
      refetchQueries: ['contractTypesMain'],
    },
  );

  const removeContractTypes = ({ contractTypeIds }, emptyBulk) => {
    contractTypesRemove({
      variables: { contractTypeIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success('You successfully deleted a contractType');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = queryParams.searchValue || '';
  const { list = [], totalCount = 0 } =
    contractTypesMainQuery?.data?.contractTypesMain || {};

  const updatedProps = {
    ...props,
    totalCount,
    searchValue,
    contractTypes: list,
    loading: contractTypesMainQuery.loading,
    removeContractTypes,
  };

  const contractTypesList = (props) => {
    return <ContractTypesList {...updatedProps} {...props} />;
  };

  const refetch = () => {
    contractTypesMainQuery.refetch();
  };

  return <Bulk content={contractTypesList} refetch={refetch} />;
};

export default ContractTypeListContainer;
