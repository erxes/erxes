import { Alert, Bulk, router } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import React from 'react';

import PurposesList from '../components/PurposesList';
import { mutations, queries } from '../graphql';
import { MainQueryResponse, RemoveMutationResponse } from '../types';
import { useMutation, useQuery } from '@apollo/client';

type Props = {
  queryParams: any;
};

const ContractTypeListContainer = (props: Props) => {
  const { queryParams } = props;

  const purposeQuery = useQuery<MainQueryResponse>(gql(queries.purposes), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      parentId: queryParams.parentId,
      searchValue: queryParams.searchValue,
    },
    fetchPolicy: 'network-only',
  });

  const [purposesRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.purposesRemove),
    {
      refetchQueries: ['purposes'],
    }
  );

  const removePurpose = ({ purposeIds }, emptyBulk) => {
    purposesRemove({
      variables: { purposeIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success('You successfully deleted a purpose');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = queryParams.searchValue || '';

  const { list = [], totalCount = 0 } = purposeQuery?.data?.purposesMain || {};

  const updatedProps = {
    ...props,
    searchValue,
    purposes: list,
    totalCount,
    loading: purposeQuery.loading,
    removePurpose,
  };

  const contractTypesList = (props) => {
    return <PurposesList {...updatedProps} {...props} />;
  };

  const refetch = () => {
    purposeQuery.refetch();
  };

  return <Bulk content={contractTypesList} refetch={refetch} />;
};

export default ContractTypeListContainer;
