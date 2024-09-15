import { Alert, EmptyState, Spinner, confirm } from '@erxes/ui/src';
import React, { useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';

import ListComponent from '../components/List';
import { generateCardFiltersQueryParams } from '../common/utils';
import { generateParamsIds } from '../../common/utils';
import { router } from '@erxes/ui/src/utils/core';

type Props = {
  queryParams: any;
};

const List = ({ queryParams }: Props) => {
  const variables = generateParams({ queryParams });

  const { loading: listLoading, data: listData } = useQuery(
    gql(queries.riskAssessments),
    {
      variables
    }
  );

  const { data: totalCountData, refetch: refetchTotalCount } = useQuery(
    gql(queries.totalCount),
    {
      variables
    }
  );

  const [removeAssessments] = useMutation(gql(mutations.removeAssessments), {
    refetchQueries: [
      {
        query: gql(queries.riskAssessments),
        variables
      },
      {
        query: gql(queries.totalCount),
        variables
      }
    ]
  });

  useEffect(() => {
    refetchTotalCount();
  }, [queryParams]);

  const remove = ids => {
    confirm(
      'This action will erase every data of assessments. Are you sure?'
    ).then(() => {
      removeAssessments({ variables: { ids } })
        .then(() => {
          Alert.success('Removed successfully');
          refetchTotalCount();
        })
        .catch(err => {
          Alert.error(err.message);
        });
    });
  };

  if (listLoading) {
    return <Spinner />;
  }

  const updatedProps = {
    list: listData?.riskAssessments || [],
    totalCount: totalCountData?.riskAssessmentsTotalCount,
    queryParams,
    remove
  };

  return <ListComponent {...updatedProps} />;
};

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  cardType: queryParams?.cardType,
  riskIndicatorIds: queryParams?.riskIndicatorIds,
  status: queryParams?.status,
  searchValue: queryParams?.searchValue,
  sortField: queryParams?.sortField,
  sortDirection: Number(queryParams?.sortDirection) || undefined,
  createdAtFrom: queryParams.createdAtFrom || undefined,
  createdAtTo: queryParams.createdAtTo || undefined,
  closedAtFrom: queryParams.closedAtFrom || undefined,
  closedAtTo: queryParams.closedAtTo || undefined,
  branchIds: generateParamsIds(queryParams.branchIds),
  departmentIds: generateParamsIds(queryParams.departmentIds),
  operationIds: generateParamsIds(queryParams.operationIds),
  tagIds: generateParamsIds(queryParams.tagIds),
  groupIds: generateParamsIds(queryParams.groupIds),
  cardFilter: generateCardFiltersQueryParams(queryParams)
});

export default List;
