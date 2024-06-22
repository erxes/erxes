import { Alert, Bulk, router } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import React, { useState } from 'react';

import InsuranceTypesList from '../components/InsuranceTypesList';
import { mutations, queries } from '../graphql';
import { MainQueryResponse, RemoveMutationResponse } from '../types';
import { useMutation, useQuery } from '@apollo/client';

type Props = {
  queryParams: any;
};

const InsuranceTypeListContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { queryParams } = props;

  const insuranceTypesMainQuery = useQuery<MainQueryResponse>(
    gql(queries.insuranceTypesMain),
    {
      variables: {
        ...router.generatePaginationParams(queryParams || {}),
        ids: queryParams.ids,
        companyId: queryParams.companyId,
        searchValue: queryParams.searchValue,
        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [insuranceTypesRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.insuranceTypesRemove),
    {
      refetchQueries: ['insuranceTypesMain'],
    },
  );

  const removeInsuranceTypes = ({ insuranceTypeIds }, emptyBulk) => {
    insuranceTypesRemove({
      variables: { insuranceTypeIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success('You successfully deleted a insuranceType');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = queryParams.searchValue || '';
  const { list = [], totalCount = 0 } =
    insuranceTypesMainQuery?.data?.insuranceTypesMain || {};

  const updatedProps = {
    ...props,
    totalCount,
    searchValue,
    insuranceTypes: list,
    loading: insuranceTypesMainQuery.loading || loading,
    removeInsuranceTypes,
  };

  const insuranceTypesList = (props) => {
    return <InsuranceTypesList {...updatedProps} {...props} />;
  };

  const refetch = () => {
    insuranceTypesMainQuery.refetch();
  };

  return <Bulk content={insuranceTypesList} refetch={refetch} />;
};

export default InsuranceTypeListContainer;
